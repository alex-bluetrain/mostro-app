import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  createLibrary,
  defineComponent,
  reactive,
  useTriggerAction,
  type ActionPlan,
  type ComponentRenderProps,
} from '@openuidev/react-lang';
import { z } from 'zod/v4';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Native OpenUI Lang component library for the mostro chat renderer.
 *
 * The component NAMES and the ORDER of the props in each `z.object({...})`
 * MUST match the backend's `openuiChatLibrary` signatures exactly — the parser
 * maps positional args to prop keys by declaration order. Names/order were
 * lifted verbatim from mostro's `@openuidev/react-ui` genui-lib source.
 *
 * Only the common chat components are rendered richly here. Container children
 * use `z.array(z.any())` so unknown child nodes still parse; anything whose
 * `typeName` is not registered renders as `null` (the renderer never crashes on
 * unknown components — see RenderNode in react-lang).
 */

type Renderer<P> = (p: ComponentRenderProps<P>) => ReactNode;

const anyChildren = z.array(z.any());

// ── Content ──

const TextContent = defineComponent({
  name: 'TextContent',
  props: z.object({
    text: z.string(),
    size: z
      .enum(['small', 'default', 'large', 'small-heavy', 'large-heavy'])
      .optional(),
  }),
  description: 'A block of text.',
  component: (({ props }) => {
    const type =
      props.size === 'large' || props.size === 'large-heavy'
        ? 'subtitle'
        : props.size === 'small' || props.size === 'small-heavy'
          ? 'small'
          : 'default';
    return (
      <ThemedText type={type} style={styles.blockGap}>
        {props.text}
      </ThemedText>
    );
  }) as Renderer<{ text: string; size?: string }>,
});

const MarkDownRenderer = defineComponent({
  name: 'MarkDownRenderer',
  props: z.object({
    textMarkdown: z.string(),
    variant: z.enum(['clear', 'card', 'sunk']).optional(),
  }),
  description: 'Markdown text (rendered as plain text natively).',
  component: (({ props }) => (
    <ThemedText style={styles.blockGap}>{props.textMarkdown}</ThemedText>
  )) as Renderer<{ textMarkdown: string; variant?: string }>,
});

const CardHeader = defineComponent({
  name: 'CardHeader',
  props: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }),
  description: 'Header with optional title and subtitle.',
  component: (({ props }) => (
    <View style={styles.blockGap}>
      {props.title ? <ThemedText type="subtitle">{props.title}</ThemedText> : null}
      {props.subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {props.subtitle}
        </ThemedText>
      ) : null}
    </View>
  )) as Renderer<{ title?: string; subtitle?: string }>,
});

const CALLOUT_COLORS: Record<string, string> = {
  info: '#3c87f7',
  success: '#30a46c',
  warning: '#f5a623',
  error: '#e5484d',
  neutral: '#60646C',
};

const Callout = defineComponent({
  name: 'Callout',
  props: z.object({
    variant: z.enum(['info', 'warning', 'error', 'success', 'neutral']),
    title: z.string(),
    description: z.string(),
    visible: reactive(z.boolean().optional()),
  }),
  description: 'Callout banner.',
  component: (({ props }) => {
    const accent = CALLOUT_COLORS[props.variant] ?? CALLOUT_COLORS.info;
    return (
      <ThemedView
        type="backgroundElement"
        style={[styles.callout, styles.blockGap, { borderLeftColor: accent }]}>
        <ThemedText type="smallBold" style={{ color: accent }}>
          {props.title}
        </ThemedText>
        <ThemedText type="small">{props.description}</ThemedText>
      </ThemedView>
    );
  }) as Renderer<{ variant: string; title: string; description: string; visible?: unknown }>,
});

const TextCallout = defineComponent({
  name: 'TextCallout',
  props: z.object({
    text: z.string(),
  }),
  description: 'Short highlighted text.',
  component: (({ props }) => (
    <ThemedView type="backgroundElement" style={[styles.callout, styles.blockGap]}>
      <ThemedText type="small">{props.text}</ThemedText>
    </ThemedView>
  )) as Renderer<{ text: string }>,
});

const CodeBlock = defineComponent({
  name: 'CodeBlock',
  props: z.object({
    language: z.string(),
    codeString: z.string(),
  }),
  description: 'Syntax-highlighted code block.',
  component: (({ props }) => (
    <ThemedView type="backgroundSelected" style={[styles.codeBlock, styles.blockGap]}>
      <ThemedText type="code">{props.codeString}</ThemedText>
    </ThemedView>
  )) as Renderer<{ language: string; codeString: string }>,
});

const Separator = defineComponent({
  name: 'Separator',
  props: z.object({
    orientation: z.enum(['horizontal', 'vertical']).optional(),
    decorative: z.boolean().optional(),
  }),
  description: 'Visual divider.',
  component: (() => {
    const Hr = () => {
      const theme = useTheme();
      return <View style={[styles.separator, { backgroundColor: theme.backgroundSelected }]} />;
    };
    return <Hr />;
  }) as Renderer<{ orientation?: string; decorative?: boolean }>,
});

const OpenUIImage = defineComponent({
  name: 'Image',
  props: z.object({
    alt: z.string(),
    src: z.string().optional(),
  }),
  description: 'An image.',
  component: (({ props }) =>
    props.src ? (
      <Image
        source={{ uri: props.src }}
        accessibilityLabel={props.alt}
        style={styles.image}
        contentFit="cover"
      />
    ) : null) as Renderer<{ alt: string; src?: string }>,
});

// ── Layout / containers ──

const Card = defineComponent({
  name: 'Card',
  props: z.object({
    children: anyChildren,
  }),
  description: 'Vertical container for a chat response.',
  component: (({ props, renderNode }) => (
    <View style={styles.card}>{renderNode(props.children)}</View>
  )) as Renderer<{ children: unknown[] }>,
});

const SectionBlock = defineComponent({
  name: 'SectionBlock',
  props: z.object({
    sections: anyChildren,
    isFoldable: z.boolean().optional(),
  }),
  description: 'Group of sections.',
  component: (({ props, renderNode }) => (
    <View style={styles.card}>{renderNode(props.sections)}</View>
  )) as Renderer<{ sections: unknown[]; isFoldable?: boolean }>,
});

const SectionItem = defineComponent({
  name: 'SectionItem',
  props: z.object({
    value: z.string(),
    trigger: z.string(),
    content: anyChildren,
  }),
  description: 'A single collapsible section (rendered flat natively).',
  component: (({ props, renderNode }) => (
    <View style={styles.blockGap}>
      <ThemedText type="smallBold">{props.trigger}</ThemedText>
      {renderNode(props.content)}
    </View>
  )) as Renderer<{ value: string; trigger: string; content: unknown[] }>,
});

// ── Lists & follow-ups ──

const ListBlock = defineComponent({
  name: 'ListBlock',
  props: z.object({
    items: anyChildren,
    variant: z.enum(['number', 'bullet', 'image']).optional(),
  }),
  description: 'A list of ListItem entries.',
  component: (({ props, renderNode }) => (
    <View style={[styles.blockGap, styles.list]}>{renderNode(props.items)}</View>
  )) as Renderer<{ items: unknown[]; variant?: string }>,
});

const ListItem = defineComponent({
  name: 'ListItem',
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    image: z
      .object({ src: z.string(), alt: z.string() })
      .optional(),
    actionLabel: z.string().optional(),
    action: z.any().optional(),
  }),
  description: 'A list item; clickable when it has an action.',
  component: (({ props }) => {
    const trigger = useTriggerAction();
    return (
      <Pressable
        style={styles.listItem}
        onPress={() => trigger(props.title, undefined, props.action as ActionPlan | undefined)}>
        <ThemedText type="smallBold">{props.title}</ThemedText>
        {props.subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {props.subtitle}
          </ThemedText>
        ) : null}
      </Pressable>
    );
  }) as Renderer<{
    title: string;
    subtitle?: string;
    image?: { src: string; alt: string };
    actionLabel?: string;
    action?: unknown;
  }>,
});

const FollowUpBlock = defineComponent({
  name: 'FollowUpBlock',
  props: z.object({
    items: anyChildren,
  }),
  description: 'Clickable follow-up suggestions at the end of a response.',
  component: (({ props, renderNode }) => (
    <View style={[styles.blockGap, styles.followUps]}>{renderNode(props.items)}</View>
  )) as Renderer<{ items: unknown[] }>,
});

const FollowUpItem = defineComponent({
  name: 'FollowUpItem',
  props: z.object({
    text: z.string(),
  }),
  description: 'A clickable follow-up suggestion.',
  component: (({ props }) => {
    const trigger = useTriggerAction();
    return (
      <Pressable style={styles.followUp} onPress={() => trigger(props.text)}>
        <ThemedText type="linkPrimary">{props.text}</ThemedText>
      </Pressable>
    );
  }) as Renderer<{ text: string }>,
});

// ── Buttons ──

const Button = defineComponent({
  name: 'Button',
  props: z.object({
    label: z.string(),
    action: z.any().optional(),
    variant: z.enum(['primary', 'secondary', 'tertiary']).optional(),
    type: z.enum(['normal', 'destructive']).optional(),
    size: z.enum(['extra-small', 'small', 'medium', 'large']).optional(),
  }),
  description: 'A clickable button.',
  component: (({ props }) => {
    const trigger = useTriggerAction();
    const destructive = props.type === 'destructive';
    const secondary = props.variant === 'secondary' || props.variant === 'tertiary';
    return (
      <Pressable
        style={[
          styles.button,
          secondary && styles.buttonSecondary,
          destructive && styles.buttonDestructive,
        ]}
        onPress={() => trigger(props.label, undefined, props.action as ActionPlan | undefined)}>
        <ThemedText
          type="smallBold"
          style={{ color: secondary ? '#3c87f7' : '#ffffff' }}>
          {props.label}
        </ThemedText>
      </Pressable>
    );
  }) as Renderer<{
    label: string;
    action?: unknown;
    variant?: string;
    type?: string;
    size?: string;
  }>,
});

const Buttons = defineComponent({
  name: 'Buttons',
  props: z.object({
    buttons: anyChildren,
    direction: z.enum(['row', 'column']).optional(),
  }),
  description: 'A group of buttons.',
  component: (({ props, renderNode }) => (
    <View
      style={[
        styles.blockGap,
        styles.buttonsRow,
        props.direction === 'column' && styles.buttonsColumn,
      ]}>
      {renderNode(props.buttons)}
    </View>
  )) as Renderer<{ buttons: unknown[]; direction?: string }>,
});

// ── Data display ──

const TagBlock = defineComponent({
  name: 'TagBlock',
  props: z.object({
    tags: anyChildren,
  }),
  description: 'A row of tags.',
  component: (({ props, renderNode }) => (
    <View style={[styles.blockGap, styles.tagRow]}>{renderNode(props.tags)}</View>
  )) as Renderer<{ tags: unknown[] }>,
});

const Tag = defineComponent({
  name: 'Tag',
  props: z.object({
    label: z.string(),
  }),
  description: 'A single tag.',
  component: (({ props }) => (
    <ThemedView type="backgroundSelected" style={styles.tag}>
      <ThemedText type="small">{props.label}</ThemedText>
    </ThemedView>
  )) as Renderer<{ label: string }>,
});

export const nativeChatLibrary = createLibrary({
  root: 'Card',
  components: [
    Card,
    CardHeader,
    TextContent,
    MarkDownRenderer,
    Callout,
    TextCallout,
    CodeBlock,
    Separator,
    OpenUIImage,
    SectionBlock,
    SectionItem,
    ListBlock,
    ListItem,
    FollowUpBlock,
    FollowUpItem,
    Button,
    Buttons,
    TagBlock,
    Tag,
  ],
});

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  blockGap: {
    marginBottom: 0,
  },
  callout: {
    padding: Spacing.three,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3c87f7',
    gap: Spacing.one,
  },
  codeBlock: {
    padding: Spacing.three,
    borderRadius: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: Spacing.two,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  list: {
    gap: Spacing.two,
  },
  listItem: {
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  followUps: {
    gap: Spacing.two,
  },
  followUp: {
    paddingVertical: Spacing.one,
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    backgroundColor: '#3c87f7',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3c87f7',
  },
  buttonDestructive: {
    backgroundColor: '#e5484d',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  buttonsColumn: {
    flexDirection: 'column',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tag: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: 999,
  },
});

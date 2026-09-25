import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { ToolActivity as ToolActivityType } from '@openuidev/react-headless';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  activity: ToolActivityType;
};

/**
 * Compact chip showing one tool call's live status. Renders only `toolName` +
 * status — tool `input`/`result` can carry PII, so they are not surfaced here.
 * Labels are derived from the tool name (dynamic set), not i18n keys.
 */
export function ToolActivity({ activity }: Props) {
  const theme = useTheme();

  const label = prettify(activity.toolName);

  const running = activity.status === 'streaming' || activity.status === 'executing';
  const isError = activity.status === 'error';

  const icon = running ? '🔧' : isError ? '⚠' : '✓';
  const color = isError ? theme.error : running ? theme.textSecondary : theme.success;

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" style={[styles.icon, { color }]}>
        {icon}
      </ThemedText>
      <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      {running ? <ActivityIndicator size="small" color={theme.textSecondary} /> : null}
      {isError && activity.errorText ? (
        <ThemedText type="small" style={[styles.error, { color: theme.error }]}>
          {activity.errorText}
        </ThemedText>
      ) : null}
    </View>
  );
}

function prettify(toolName: string): string {
  return toolName.replace(/[_:]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.capsule,
    marginBottom: Spacing.one,
  },
  icon: {
    fontWeight: '600',
  },
  label: {
    fontWeight: '500',
  },
  error: {
    flexShrink: 1,
  },
});

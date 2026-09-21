import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

// react-native-web's TextInput invokes onKeyPress with a React synthetic
// keyboard event: `key`, `shiftKey`, `preventDefault`, and `isDefaultPrevented`
// live on the event itself (not on `nativeEvent`), and `nativeEvent.isComposing`
// is set during IME composition. On native, onKeyPress carries the key under
// `nativeEvent.key`. This type covers both shapes.
type KeyPressEvent = NativeSyntheticEvent<TextInputKeyPressEventData> & {
  key?: string;
  shiftKey?: boolean;
  preventDefault?: () => void;
  isDefaultPrevented?: () => boolean;
};

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  disabled: boolean;
  onSend: (text: string) => void;
};

export function Composer({ disabled, onSend }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    onSend(trimmed);
  };

  const canSend = value.trim().length > 0 && !disabled;

  // Enter sends; Shift+Enter inserts a newline. Only meaningful on web —
  // native soft keyboards have no Shift+Enter.
  const handleKeyPress = (event: KeyPressEvent) => {
    if (Platform.OS !== 'web') return;
    const key = event.key ?? event.nativeEvent.key;
    // Ignore Enter while an IME composition is active (e.g. accents, CJK).
    const composing = (event.nativeEvent as { isComposing?: boolean }).isComposing;
    if (key === 'Enter' && !event.shiftKey && !composing) {
      event.preventDefault?.();
      submit();
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.backgroundSelected }]}>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderRadius: Radius.capsule,
            borderCurve: 'continuous',
          },
        ]}
        value={value}
        onChangeText={setValue}
        placeholder={t('chat.composerPlaceholder')}
        placeholderTextColor={theme.textSecondary}
        onKeyPress={handleKeyPress}
        editable={!disabled}
        multiline
      />
      <Pressable
        style={[
          styles.send,
          {
            opacity: canSend ? 1 : 0.4,
            backgroundColor: theme.tint,
            borderRadius: Radius.capsule,
            borderCurve: 'continuous',
          },
        ]}
        onPress={submit}
        disabled={!canSend}>
        <ThemedText type="smallBold" style={{ color: theme.onTint }}>
          {t('chat.send')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  send: {
    height: 44,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

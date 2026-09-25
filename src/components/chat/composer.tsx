import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
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
          // Same as ThemedText: on web the TextInput carries the RNW stack.
          Platform.OS === 'web' && { fontFamily: Fonts.sans },
        ]}
        value={value}
        onChangeText={setValue}
        placeholder={t('chat.composerPlaceholder')}
        placeholderTextColor={theme.textSecondary}
        onSubmitEditing={submit}
        returnKeyType="send"
        blurOnSubmit={false}
        editable={!disabled}
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
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    height: 44,
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

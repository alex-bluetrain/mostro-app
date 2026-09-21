import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';

type Props = {
  content: string;
};

export function UserMessage({ content }: Props) {
  return (
    <View style={styles.row}>
      <ThemedView type="backgroundSelected" style={styles.bubble}>
        <ThemedText>{content}</ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: Spacing.two,
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
  },
});

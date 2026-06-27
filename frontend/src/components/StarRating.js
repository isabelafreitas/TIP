import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function StarRating({ rating = 0, size = 16, editable, onRate }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.round(rating);
        const star = <Text key={i} style={{ fontSize: size, color: filled ? COLORS.mustard : COLORS.textLight }}>★</Text>;
        return editable
          ? <TouchableOpacity key={i} onPress={() => onRate?.(i)}>{star}</TouchableOpacity>
          : star;
      })}
    </View>
  );
}

import 'package:flutter/material.dart';

final dailyDoseTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: const Color(0xff765846),
    brightness: Brightness.light,
  ),
  useMaterial3: true,
  scaffoldBackgroundColor: const Color(0xfff7f5f2),
  cardTheme: const CardThemeData(margin: EdgeInsets.only(bottom: 12)),
);

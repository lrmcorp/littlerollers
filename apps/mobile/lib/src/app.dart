import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'theme.dart';

final _router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const RoleHome()),
    GoRoute(
      path: '/customer',
      builder: (context, state) => const RoleShell(
        title: 'Customer',
        items: ['Beranda', 'Jadwal', 'Booking', 'Paket'],
      ),
    ),
    GoRoute(
      path: '/instructor',
      builder: (context, state) => const RoleShell(
        title: 'Instructor',
        items: ['Penugasan', 'Availability', 'Check-in'],
      ),
    ),
  ],
);

class DailyDoseApp extends StatelessWidget {
  const DailyDoseApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp.router(
    title: 'Daily Dose',
    theme: dailyDoseTheme,
    routerConfig: _router,
  );
}

class RoleHome extends StatelessWidget {
  const RoleHome({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Daily Dose')),
    body: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(
          'Pilih konteks',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: () => context.go('/customer'),
          child: const Text('Customer'),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: () => context.go('/instructor'),
          child: const Text('Instructor'),
        ),
      ],
    ),
  );
}

class RoleShell extends StatelessWidget {
  const RoleShell({required this.title, required this.items, super.key});
  final String title;
  final List<String> items;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(title)),
    body: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text('Foundation shell', style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 12),
        ...items.map(
          (item) => Card(
            child: ListTile(
              title: Text(item),
              subtitle: const Text('Segera tersedia'),
              trailing: const Icon(Icons.chevron_right),
            ),
          ),
        ),
      ],
    ),
  );
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'theme.dart';

final _router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const CustomerSignIn()),
    GoRoute(path: '/roles', builder: (context, state) => const RoleHome()),
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

class CustomerSignIn extends StatefulWidget {
  const CustomerSignIn({super.key});
  @override
  State<CustomerSignIn> createState() => _CustomerSignInState();
}

class _CustomerSignInState extends State<CustomerSignIn> {
  bool useOtp = false;
  bool recovery = false;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Daily Dose')),
    body: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(
          'Masuk untuk melanjutkan',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 12),
        const Text('Gunakan identitas yang sudah terverifikasi.'),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: () {},
          child: const Text('Lanjutkan dengan Google'),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: () => setState(() => useOtp = true),
          child: const Text('Gunakan OTP WhatsApp'),
        ),
        if (useOtp) ...[
          const SizedBox(height: 20),
          const TextField(
            key: Key('phone-input'),
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(labelText: 'Nomor WhatsApp'),
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: null, child: const Text('Kirim kode')),
          const Text(
            'Provider OTP belum dikonfigurasi.',
            key: Key('configuration-message'),
          ),
        ],
        TextButton(
          onPressed: () => setState(() => recovery = true),
          child: const Text('Pulihkan akun'),
        ),
        if (recovery) ...[
          const SizedBox(height: 20),
          const Text(
            'Pemulihan tidak pernah menautkan identitas yang belum diverifikasi.',
          ),
          const TextField(
            key: Key('recovery-identifier'),
            decoration: InputDecoration(
              labelText: 'Email atau nomor terverifikasi',
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: null,
            child: const Text('Minta verifikasi synthetic'),
          ),
        ],
      ],
    ),
  );
}

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

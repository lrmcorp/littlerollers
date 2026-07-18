import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'theme.dart';
import 'auth_repository.dart';

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
  const CustomerSignIn({this.repository, super.key});
  final AuthRepository? repository;
  @override
  State<CustomerSignIn> createState() => _CustomerSignInState();
}

class _CustomerSignInState extends State<CustomerSignIn> {
  bool useOtp = false;
  bool recovery = false;
  bool loading = false;
  String? message;
  String? requestId;
  final phone = TextEditingController();
  final code = TextEditingController();
  final recoveryIdentifier = TextEditingController();

  AuthRepository get repository =>
      widget.repository ?? const ConfigurationRequiredRepository();

  Future<void> run(Future<void> Function() action) async {
    setState(() {
      loading = true;
      message = null;
    });
    try {
      await action();
      setState(() => message = 'Berhasil.');
    } on AuthException catch (error) {
      setState(() => message = error.failure.name);
    } catch (_) {
      setState(() => message = AuthFailure.offline.name);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    phone.dispose();
    code.dispose();
    recoveryIdentifier.dispose();
    super.dispose();
  }

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
          onPressed: loading ? null : () => run(repository.signInGoogle),
          child: Text(loading ? 'Memproses…' : 'Lanjutkan dengan Google'),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: () => setState(() => useOtp = true),
          child: const Text('Gunakan OTP WhatsApp'),
        ),
        if (useOtp) ...[
          const SizedBox(height: 20),
          TextField(
            key: const Key('phone-input'),
            controller: phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Nomor WhatsApp'),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: loading
                ? null
                : () => run(() async {
                    requestId = await repository.requestOtp(phone.text);
                    setState(() {});
                  }),
            child: const Text('Kirim kode'),
          ),
          if (requestId != null) ...[
            TextField(
              key: const Key('otp-code'),
              controller: code,
              decoration: const InputDecoration(labelText: 'Kode OTP'),
            ),
            FilledButton(
              onPressed: () =>
                  run(() => repository.verifyOtp(requestId!, code.text)),
              child: const Text('Verifikasi OTP'),
            ),
          ],
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
          TextField(
            key: const Key('recovery-identifier'),
            controller: recoveryIdentifier,
            decoration: const InputDecoration(
              labelText: 'Email atau nomor terverifikasi',
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: loading
                ? null
                : () => run(() async {
                    await repository.requestRecovery(recoveryIdentifier.text);
                  }),
            child: const Text('Minta verifikasi synthetic'),
          ),
        ],
        if (message != null)
          Text(
            message!,
            key: const Key('auth-message'),
            semanticsLabel: 'status autentikasi',
          ),
      ],
    ),
  );
}

class ConfigurationRequiredRepository implements AuthRepository {
  const ConfigurationRequiredRepository();
  Never _fail() => throw const AuthException(AuthFailure.configuration);
  @override
  Future<void> signInGoogle() async => _fail();
  @override
  Future<String> requestOtp(String phone) async => _fail();
  @override
  Future<void> verifyOtp(String requestId, String code) async => _fail();
  @override
  Future<String> requestRecovery(String identifier) async => _fail();
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

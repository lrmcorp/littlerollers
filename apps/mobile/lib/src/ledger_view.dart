import 'package:flutter/material.dart';
import 'ledger_repository.dart';

class CustomerLedgerView extends StatefulWidget {
  const CustomerLedgerView({required this.repository, super.key});
  final LedgerRepository repository;
  @override
  State<CustomerLedgerView> createState() => _CustomerLedgerViewState();
}

class _CustomerLedgerViewState extends State<CustomerLedgerView> {
  final branch = TextEditingController();
  List<CustomerPackageLedger> packages = [];
  List<LedgerLine> history = [];
  bool loading = false;
  String? message;
  Future<void> run(Future<void> Function() action) async {
    setState(() {
      loading = true;
      message = null;
    });
    try {
      await action();
    } catch (error) {
      message = error.toString().contains('LEDGER_INVARIANT_VIOLATION')
          ? 'ledger_invariant_violation'
          : 'offline_or_configuration_required';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    branch.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Saldo paket')),
    body: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        TextField(
          key: const Key('ledger-branch'),
          controller: branch,
          decoration: const InputDecoration(labelText: 'ID cabang'),
        ),
        FilledButton(
          onPressed: loading
              ? null
              : () => run(() async {
                  packages = await widget.repository.list(
                    branchId: branch.text.isEmpty ? null : branch.text,
                  );
                }),
          child: const Text('Muat saldo'),
        ),
        if (packages.isEmpty && !loading) const Text('Belum ada paket.'),
        ...packages.map(
          (item) => Card(
            child: ListTile(
              title: Text('${item.status} · tersedia ${item.available}'),
              subtitle: Text('Total ${item.total} · reserved ${item.reserved}'),
              onTap: () => run(() async {
                history = await widget.repository.history(item.id);
              }),
            ),
          ),
        ),
        if (history.isNotEmpty) ...[
          const Text('Histori ledger'),
          ...history.map((line) => Text('${line.type} ${line.quantity}')),
        ],
        if (loading) const LinearProgressIndicator(),
        if (message != null) Text(message!, key: const Key('ledger-message')),
      ],
    ),
  );
}

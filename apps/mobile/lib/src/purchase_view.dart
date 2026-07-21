import 'package:flutter/material.dart';
import 'purchase_repository.dart';

class CustomerPurchaseView extends StatefulWidget {
  const CustomerPurchaseView({required this.repository, super.key});
  final PurchaseRepository repository;
  @override
  State<CustomerPurchaseView> createState() => _CustomerPurchaseViewState();
}

class _CustomerPurchaseViewState extends State<CustomerPurchaseView> {
  final branch = TextEditingController(),
      sha = TextEditingController(text: List.filled(64, 'a').join());
  List<PackageChoice> packages = [];
  String? packageId, proofId, message;
  ProofState? scan;
  bool loading = false;
  Future<void> run(Future<void> Function() action) async {
    setState(() {
      loading = true;
      message = null;
    });
    try {
      await action();
    } catch (_) {
      message = 'offline_or_configuration_required';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    branch.dispose();
    sha.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Beli paket')),
    body: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        TextField(
          key: const Key('purchase-branch'),
          controller: branch,
          decoration: const InputDecoration(labelText: 'ID cabang'),
        ),
        FilledButton(
          onPressed: loading
              ? null
              : () => run(() async {
                  packages = await widget.repository.listPackages(branch.text);
                  setState(() {});
                }),
          child: const Text('Muat paket'),
        ),
        DropdownButtonFormField<String>(
          key: const Key('package-choice'),
          initialValue: packageId,
          decoration: const InputDecoration(labelText: 'Paket'),
          items: packages
              .map(
                (p) => DropdownMenuItem(
                  value: p.id,
                  child: Text('${p.name} · Rp${p.priceRp}'),
                ),
              )
              .toList(),
          onChanged: (v) => setState(() => packageId = v),
        ),
        TextField(
          key: const Key('proof-sha'),
          controller: sha,
          decoration: const InputDecoration(labelText: 'Checksum bukti'),
        ),
        FilledButton(
          onPressed: packageId == null || loading
              ? null
              : () => run(() async {
                  proofId = await widget.repository.issueProof(
                    branchId: branch.text,
                    packageId: packageId!,
                    fileName: 'payment-proof.png',
                    mimeType: 'image/png',
                    sizeBytes: 1024,
                    sha256: sha.text,
                  );
                  scan = ProofState.pending;
                  setState(() {});
                  scan = await widget.repository.finalizeProof(
                    proofId!,
                    sha.text,
                    1024,
                  );
                  message = 'scan_${scan!.name}';
                }),
          child: const Text('Upload dan scan'),
        ),
        Text(
          'Status scan: ${scan?.name ?? 'belum_ada'}',
          key: const Key('scan-state'),
        ),
        FilledButton(
          onPressed: scan != ProofState.clean || loading
              ? null
              : () => run(() async {
                  await widget.repository.submit(
                    packageId!,
                    proofId!,
                    DateTime.now().microsecondsSinceEpoch.toString(),
                  );
                  message = 'purchase_pending';
                }),
          child: const Text('Kirim purchase'),
        ),
        if (loading) const LinearProgressIndicator(),
        if (message != null) Text(message!, key: const Key('purchase-message')),
      ],
    ),
  );
}

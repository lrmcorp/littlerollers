import 'package:flutter/material.dart';
import 'availability_repository.dart';

class InstructorAvailabilityView extends StatefulWidget {
  const InstructorAvailabilityView({required this.repository, super.key});
  final AvailabilityRepository repository;
  @override
  State<InstructorAvailabilityView> createState() =>
      _InstructorAvailabilityViewState();
}

class _InstructorAvailabilityViewState
    extends State<InstructorAvailabilityView> {
  final branch = TextEditingController();
  final from = TextEditingController();
  final until = TextEditingController();
  final start = TextEditingController();
  final end = TextEditingController();
  List<InstructorAvailabilityItem> items = [];
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
      final text = error.toString();
      message = text.contains('EFFECTIVE_PERIOD_OVERLAP')
          ? 'Jadwal bentrok.'
          : text.contains('RESOURCE_NOT_FOUND')
          ? 'Assignment tidak tersedia.'
          : text.contains('VALIDATION_ERROR')
          ? 'Rentang waktu tidak valid.'
          : 'Offline atau konfigurasi belum tersedia.';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  DateTime? parsed(String value) =>
      value.trim().isEmpty ? null : DateTime.tryParse(value.trim());
  @override
  void dispose() {
    branch.dispose();
    from.dispose();
    until.dispose();
    start.dispose();
    end.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Availability Instructor')),
    body: ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text(
          'Waktu disimpan sebagai UTC dan ditampilkan dengan timezone cabang.',
        ),
        TextField(
          key: const Key('availability-branch'),
          controller: branch,
          decoration: const InputDecoration(labelText: 'ID cabang'),
        ),
        TextField(
          key: const Key('availability-from'),
          controller: from,
          decoration: const InputDecoration(labelText: 'Filter mulai RFC3339'),
        ),
        TextField(
          key: const Key('availability-until'),
          controller: until,
          decoration: const InputDecoration(labelText: 'Filter sampai RFC3339'),
        ),
        FilledButton(
          onPressed: loading
              ? null
              : () => run(() async {
                  items = await widget.repository.list(
                    branchId: branch.text.isEmpty ? null : branch.text,
                    from: parsed(from.text),
                    until: parsed(until.text),
                  );
                  message = items.isEmpty
                      ? 'Belum ada availability.'
                      : 'Availability dimuat.';
                }),
          child: const Text('Muat availability'),
        ),
        const Divider(),
        TextField(
          key: const Key('availability-start'),
          controller: start,
          decoration: const InputDecoration(
            labelText: 'Mulai RFC3339 dengan offset',
          ),
        ),
        TextField(
          key: const Key('availability-end'),
          controller: end,
          decoration: const InputDecoration(
            labelText: 'Selesai RFC3339 dengan offset',
          ),
        ),
        FilledButton(
          onPressed: loading
              ? null
              : () => run(() async {
                  final startAt = parsed(start.text), endAt = parsed(end.text);
                  if (startAt == null ||
                      endAt == null ||
                      !endAt.isAfter(startAt)) {
                    throw StateError('VALIDATION_ERROR');
                  }
                  await widget.repository.create(
                    branchId: branch.text,
                    startAt: startAt,
                    endAt: endAt,
                  );
                  items = await widget.repository.list(branchId: branch.text);
                  message = 'Availability berhasil dibuat.';
                }),
          child: const Text('Tambah availability'),
        ),
        if (loading) const LinearProgressIndicator(),
        if (message != null)
          Text(message!, key: const Key('availability-message')),
        if (items.isEmpty && !loading && message == null)
          const Text('Belum ada availability.'),
        ...items.map(
          (item) => Card(
            child: ListTile(
              title: Text('${item.status} · ${item.timezone}'),
              subtitle: Text(
                '${item.startAt.toIso8601String()} – ${item.endAt.toIso8601String()}',
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

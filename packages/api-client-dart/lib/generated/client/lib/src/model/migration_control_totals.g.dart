// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_control_totals.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MigrationControlTotals extends MigrationControlTotals {
  @override
  final int read;
  @override
  final int accepted;
  @override
  final int rejected;
  @override
  final int? created;
  @override
  final int? updated;
  @override
  final int? openingLedgerEntries;
  @override
  final String? controlHash;

  factory _$MigrationControlTotals([
    void Function(MigrationControlTotalsBuilder)? updates,
  ]) => (MigrationControlTotalsBuilder()..update(updates))._build();

  _$MigrationControlTotals._({
    required this.read,
    required this.accepted,
    required this.rejected,
    this.created,
    this.updated,
    this.openingLedgerEntries,
    this.controlHash,
  }) : super._();
  @override
  MigrationControlTotals rebuild(
    void Function(MigrationControlTotalsBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationControlTotalsBuilder toBuilder() =>
      MigrationControlTotalsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationControlTotals &&
        read == other.read &&
        accepted == other.accepted &&
        rejected == other.rejected &&
        created == other.created &&
        updated == other.updated &&
        openingLedgerEntries == other.openingLedgerEntries &&
        controlHash == other.controlHash;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, read.hashCode);
    _$hash = $jc(_$hash, accepted.hashCode);
    _$hash = $jc(_$hash, rejected.hashCode);
    _$hash = $jc(_$hash, created.hashCode);
    _$hash = $jc(_$hash, updated.hashCode);
    _$hash = $jc(_$hash, openingLedgerEntries.hashCode);
    _$hash = $jc(_$hash, controlHash.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MigrationControlTotals')
          ..add('read', read)
          ..add('accepted', accepted)
          ..add('rejected', rejected)
          ..add('created', created)
          ..add('updated', updated)
          ..add('openingLedgerEntries', openingLedgerEntries)
          ..add('controlHash', controlHash))
        .toString();
  }
}

class MigrationControlTotalsBuilder
    implements Builder<MigrationControlTotals, MigrationControlTotalsBuilder> {
  _$MigrationControlTotals? _$v;

  int? _read;
  int? get read => _$this._read;
  set read(int? read) => _$this._read = read;

  int? _accepted;
  int? get accepted => _$this._accepted;
  set accepted(int? accepted) => _$this._accepted = accepted;

  int? _rejected;
  int? get rejected => _$this._rejected;
  set rejected(int? rejected) => _$this._rejected = rejected;

  int? _created;
  int? get created => _$this._created;
  set created(int? created) => _$this._created = created;

  int? _updated;
  int? get updated => _$this._updated;
  set updated(int? updated) => _$this._updated = updated;

  int? _openingLedgerEntries;
  int? get openingLedgerEntries => _$this._openingLedgerEntries;
  set openingLedgerEntries(int? openingLedgerEntries) =>
      _$this._openingLedgerEntries = openingLedgerEntries;

  String? _controlHash;
  String? get controlHash => _$this._controlHash;
  set controlHash(String? controlHash) => _$this._controlHash = controlHash;

  MigrationControlTotalsBuilder() {
    MigrationControlTotals._defaults(this);
  }

  MigrationControlTotalsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _read = $v.read;
      _accepted = $v.accepted;
      _rejected = $v.rejected;
      _created = $v.created;
      _updated = $v.updated;
      _openingLedgerEntries = $v.openingLedgerEntries;
      _controlHash = $v.controlHash;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MigrationControlTotals other) {
    _$v = other as _$MigrationControlTotals;
  }

  @override
  void update(void Function(MigrationControlTotalsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationControlTotals build() => _build();

  _$MigrationControlTotals _build() {
    final _$result =
        _$v ??
        _$MigrationControlTotals._(
          read: BuiltValueNullFieldError.checkNotNull(
            read,
            r'MigrationControlTotals',
            'read',
          ),
          accepted: BuiltValueNullFieldError.checkNotNull(
            accepted,
            r'MigrationControlTotals',
            'accepted',
          ),
          rejected: BuiltValueNullFieldError.checkNotNull(
            rejected,
            r'MigrationControlTotals',
            'rejected',
          ),
          created: created,
          updated: updated,
          openingLedgerEntries: openingLedgerEntries,
          controlHash: controlHash,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

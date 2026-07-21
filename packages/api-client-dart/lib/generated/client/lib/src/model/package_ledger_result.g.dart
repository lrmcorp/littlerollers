// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_ledger_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageLedgerResult extends PackageLedgerResult {
  @override
  final CustomerPackageBalance balance;
  @override
  final ReservationSummary reservations;
  @override
  final BuiltList<LedgerEntry> entries;
  @override
  final CursorPageMeta page;

  factory _$PackageLedgerResult([
    void Function(PackageLedgerResultBuilder)? updates,
  ]) => (PackageLedgerResultBuilder()..update(updates))._build();

  _$PackageLedgerResult._({
    required this.balance,
    required this.reservations,
    required this.entries,
    required this.page,
  }) : super._();
  @override
  PackageLedgerResult rebuild(
    void Function(PackageLedgerResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageLedgerResultBuilder toBuilder() =>
      PackageLedgerResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageLedgerResult &&
        balance == other.balance &&
        reservations == other.reservations &&
        entries == other.entries &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, balance.hashCode);
    _$hash = $jc(_$hash, reservations.hashCode);
    _$hash = $jc(_$hash, entries.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageLedgerResult')
          ..add('balance', balance)
          ..add('reservations', reservations)
          ..add('entries', entries)
          ..add('page', page))
        .toString();
  }
}

class PackageLedgerResultBuilder
    implements Builder<PackageLedgerResult, PackageLedgerResultBuilder> {
  _$PackageLedgerResult? _$v;

  CustomerPackageBalanceBuilder? _balance;
  CustomerPackageBalanceBuilder get balance =>
      _$this._balance ??= CustomerPackageBalanceBuilder();
  set balance(CustomerPackageBalanceBuilder? balance) =>
      _$this._balance = balance;

  ReservationSummaryBuilder? _reservations;
  ReservationSummaryBuilder get reservations =>
      _$this._reservations ??= ReservationSummaryBuilder();
  set reservations(ReservationSummaryBuilder? reservations) =>
      _$this._reservations = reservations;

  ListBuilder<LedgerEntry>? _entries;
  ListBuilder<LedgerEntry> get entries =>
      _$this._entries ??= ListBuilder<LedgerEntry>();
  set entries(ListBuilder<LedgerEntry>? entries) => _$this._entries = entries;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PackageLedgerResultBuilder() {
    PackageLedgerResult._defaults(this);
  }

  PackageLedgerResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _balance = $v.balance.toBuilder();
      _reservations = $v.reservations.toBuilder();
      _entries = $v.entries.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageLedgerResult other) {
    _$v = other as _$PackageLedgerResult;
  }

  @override
  void update(void Function(PackageLedgerResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageLedgerResult build() => _build();

  _$PackageLedgerResult _build() {
    _$PackageLedgerResult _$result;
    try {
      _$result =
          _$v ??
          _$PackageLedgerResult._(
            balance: balance.build(),
            reservations: reservations.build(),
            entries: entries.build(),
            page: page.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'balance';
        balance.build();
        _$failedField = 'reservations';
        reservations.build();
        _$failedField = 'entries';
        entries.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackageLedgerResult',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

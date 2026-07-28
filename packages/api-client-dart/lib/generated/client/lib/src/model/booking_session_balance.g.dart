// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_session_balance.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingSessionBalance extends BookingSessionBalance {
  @override
  final int ledgerBalance;
  @override
  final int reserved;
  @override
  final int available;

  factory _$BookingSessionBalance([
    void Function(BookingSessionBalanceBuilder)? updates,
  ]) => (BookingSessionBalanceBuilder()..update(updates))._build();

  _$BookingSessionBalance._({
    required this.ledgerBalance,
    required this.reserved,
    required this.available,
  }) : super._();
  @override
  BookingSessionBalance rebuild(
    void Function(BookingSessionBalanceBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BookingSessionBalanceBuilder toBuilder() =>
      BookingSessionBalanceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingSessionBalance &&
        ledgerBalance == other.ledgerBalance &&
        reserved == other.reserved &&
        available == other.available;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, ledgerBalance.hashCode);
    _$hash = $jc(_$hash, reserved.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingSessionBalance')
          ..add('ledgerBalance', ledgerBalance)
          ..add('reserved', reserved)
          ..add('available', available))
        .toString();
  }
}

class BookingSessionBalanceBuilder
    implements Builder<BookingSessionBalance, BookingSessionBalanceBuilder> {
  _$BookingSessionBalance? _$v;

  int? _ledgerBalance;
  int? get ledgerBalance => _$this._ledgerBalance;
  set ledgerBalance(int? ledgerBalance) =>
      _$this._ledgerBalance = ledgerBalance;

  int? _reserved;
  int? get reserved => _$this._reserved;
  set reserved(int? reserved) => _$this._reserved = reserved;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  BookingSessionBalanceBuilder() {
    BookingSessionBalance._defaults(this);
  }

  BookingSessionBalanceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _ledgerBalance = $v.ledgerBalance;
      _reserved = $v.reserved;
      _available = $v.available;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingSessionBalance other) {
    _$v = other as _$BookingSessionBalance;
  }

  @override
  void update(void Function(BookingSessionBalanceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingSessionBalance build() => _build();

  _$BookingSessionBalance _build() {
    final _$result =
        _$v ??
        _$BookingSessionBalance._(
          ledgerBalance: BuiltValueNullFieldError.checkNotNull(
            ledgerBalance,
            r'BookingSessionBalance',
            'ledgerBalance',
          ),
          reserved: BuiltValueNullFieldError.checkNotNull(
            reserved,
            r'BookingSessionBalance',
            'reserved',
          ),
          available: BuiltValueNullFieldError.checkNotNull(
            available,
            r'BookingSessionBalance',
            'available',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

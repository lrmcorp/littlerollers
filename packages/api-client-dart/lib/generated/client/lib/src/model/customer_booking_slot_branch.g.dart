// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_slot_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerBookingSlotBranch extends CustomerBookingSlotBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;

  factory _$CustomerBookingSlotBranch([
    void Function(CustomerBookingSlotBranchBuilder)? updates,
  ]) => (CustomerBookingSlotBranchBuilder()..update(updates))._build();

  _$CustomerBookingSlotBranch._({
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  CustomerBookingSlotBranch rebuild(
    void Function(CustomerBookingSlotBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingSlotBranchBuilder toBuilder() =>
      CustomerBookingSlotBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingSlotBranch &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingSlotBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class CustomerBookingSlotBranchBuilder
    implements
        Builder<CustomerBookingSlotBranch, CustomerBookingSlotBranchBuilder> {
  _$CustomerBookingSlotBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  CustomerBookingSlotBranchBuilder() {
    CustomerBookingSlotBranch._defaults(this);
  }

  CustomerBookingSlotBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingSlotBranch other) {
    _$v = other as _$CustomerBookingSlotBranch;
  }

  @override
  void update(void Function(CustomerBookingSlotBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingSlotBranch build() => _build();

  _$CustomerBookingSlotBranch _build() {
    final _$result =
        _$v ??
        _$CustomerBookingSlotBranch._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerBookingSlotBranch',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'CustomerBookingSlotBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'CustomerBookingSlotBranch',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'CustomerBookingSlotBranch',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

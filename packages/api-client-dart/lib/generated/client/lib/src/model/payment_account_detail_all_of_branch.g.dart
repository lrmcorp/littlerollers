// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_account_detail_all_of_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentAccountDetailAllOfBranch
    extends PaymentAccountDetailAllOfBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final bool active;

  factory _$PaymentAccountDetailAllOfBranch([
    void Function(PaymentAccountDetailAllOfBranchBuilder)? updates,
  ]) => (PaymentAccountDetailAllOfBranchBuilder()..update(updates))._build();

  _$PaymentAccountDetailAllOfBranch._({
    required this.id,
    required this.code,
    required this.name,
    required this.active,
  }) : super._();
  @override
  PaymentAccountDetailAllOfBranch rebuild(
    void Function(PaymentAccountDetailAllOfBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentAccountDetailAllOfBranchBuilder toBuilder() =>
      PaymentAccountDetailAllOfBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentAccountDetailAllOfBranch &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        active == other.active;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentAccountDetailAllOfBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('active', active))
        .toString();
  }
}

class PaymentAccountDetailAllOfBranchBuilder
    implements
        Builder<
          PaymentAccountDetailAllOfBranch,
          PaymentAccountDetailAllOfBranchBuilder
        > {
  _$PaymentAccountDetailAllOfBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  PaymentAccountDetailAllOfBranchBuilder() {
    PaymentAccountDetailAllOfBranch._defaults(this);
  }

  PaymentAccountDetailAllOfBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _active = $v.active;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentAccountDetailAllOfBranch other) {
    _$v = other as _$PaymentAccountDetailAllOfBranch;
  }

  @override
  void update(void Function(PaymentAccountDetailAllOfBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentAccountDetailAllOfBranch build() => _build();

  _$PaymentAccountDetailAllOfBranch _build() {
    final _$result =
        _$v ??
        _$PaymentAccountDetailAllOfBranch._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PaymentAccountDetailAllOfBranch',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'PaymentAccountDetailAllOfBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PaymentAccountDetailAllOfBranch',
            'name',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'PaymentAccountDetailAllOfBranch',
            'active',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

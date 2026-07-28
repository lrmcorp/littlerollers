// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_access_effective.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserAccessEffective extends UserAccessEffective {
  @override
  final BuiltList<String> capabilities;
  @override
  final BuiltList<String> branches;
  @override
  final BuiltList<EffectiveCapabilityGrant> grants;
  @override
  final BuiltList<EffectiveCapabilityDenial> denials;

  factory _$UserAccessEffective([
    void Function(UserAccessEffectiveBuilder)? updates,
  ]) => (UserAccessEffectiveBuilder()..update(updates))._build();

  _$UserAccessEffective._({
    required this.capabilities,
    required this.branches,
    required this.grants,
    required this.denials,
  }) : super._();
  @override
  UserAccessEffective rebuild(
    void Function(UserAccessEffectiveBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserAccessEffectiveBuilder toBuilder() =>
      UserAccessEffectiveBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserAccessEffective &&
        capabilities == other.capabilities &&
        branches == other.branches &&
        grants == other.grants &&
        denials == other.denials;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, capabilities.hashCode);
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jc(_$hash, grants.hashCode);
    _$hash = $jc(_$hash, denials.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserAccessEffective')
          ..add('capabilities', capabilities)
          ..add('branches', branches)
          ..add('grants', grants)
          ..add('denials', denials))
        .toString();
  }
}

class UserAccessEffectiveBuilder
    implements Builder<UserAccessEffective, UserAccessEffectiveBuilder> {
  _$UserAccessEffective? _$v;

  ListBuilder<String>? _capabilities;
  ListBuilder<String> get capabilities =>
      _$this._capabilities ??= ListBuilder<String>();
  set capabilities(ListBuilder<String>? capabilities) =>
      _$this._capabilities = capabilities;

  ListBuilder<String>? _branches;
  ListBuilder<String> get branches =>
      _$this._branches ??= ListBuilder<String>();
  set branches(ListBuilder<String>? branches) => _$this._branches = branches;

  ListBuilder<EffectiveCapabilityGrant>? _grants;
  ListBuilder<EffectiveCapabilityGrant> get grants =>
      _$this._grants ??= ListBuilder<EffectiveCapabilityGrant>();
  set grants(ListBuilder<EffectiveCapabilityGrant>? grants) =>
      _$this._grants = grants;

  ListBuilder<EffectiveCapabilityDenial>? _denials;
  ListBuilder<EffectiveCapabilityDenial> get denials =>
      _$this._denials ??= ListBuilder<EffectiveCapabilityDenial>();
  set denials(ListBuilder<EffectiveCapabilityDenial>? denials) =>
      _$this._denials = denials;

  UserAccessEffectiveBuilder() {
    UserAccessEffective._defaults(this);
  }

  UserAccessEffectiveBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _capabilities = $v.capabilities.toBuilder();
      _branches = $v.branches.toBuilder();
      _grants = $v.grants.toBuilder();
      _denials = $v.denials.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserAccessEffective other) {
    _$v = other as _$UserAccessEffective;
  }

  @override
  void update(void Function(UserAccessEffectiveBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserAccessEffective build() => _build();

  _$UserAccessEffective _build() {
    _$UserAccessEffective _$result;
    try {
      _$result =
          _$v ??
          _$UserAccessEffective._(
            capabilities: capabilities.build(),
            branches: branches.build(),
            grants: grants.build(),
            denials: denials.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'capabilities';
        capabilities.build();
        _$failedField = 'branches';
        branches.build();
        _$failedField = 'grants';
        grants.build();
        _$failedField = 'denials';
        denials.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserAccessEffective',
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

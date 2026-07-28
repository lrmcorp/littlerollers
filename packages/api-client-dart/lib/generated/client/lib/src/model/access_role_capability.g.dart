// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_role_capability.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AccessRoleCapability extends AccessRoleCapability {
  @override
  final String key;
  @override
  final String label;
  @override
  final String category;
  @override
  final bool sensitive;
  @override
  final bool systemOnly;
  @override
  final bool globalOnly;

  factory _$AccessRoleCapability([
    void Function(AccessRoleCapabilityBuilder)? updates,
  ]) => (AccessRoleCapabilityBuilder()..update(updates))._build();

  _$AccessRoleCapability._({
    required this.key,
    required this.label,
    required this.category,
    required this.sensitive,
    required this.systemOnly,
    required this.globalOnly,
  }) : super._();
  @override
  AccessRoleCapability rebuild(
    void Function(AccessRoleCapabilityBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AccessRoleCapabilityBuilder toBuilder() =>
      AccessRoleCapabilityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccessRoleCapability &&
        key == other.key &&
        label == other.label &&
        category == other.category &&
        sensitive == other.sensitive &&
        systemOnly == other.systemOnly &&
        globalOnly == other.globalOnly;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, key.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, sensitive.hashCode);
    _$hash = $jc(_$hash, systemOnly.hashCode);
    _$hash = $jc(_$hash, globalOnly.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccessRoleCapability')
          ..add('key', key)
          ..add('label', label)
          ..add('category', category)
          ..add('sensitive', sensitive)
          ..add('systemOnly', systemOnly)
          ..add('globalOnly', globalOnly))
        .toString();
  }
}

class AccessRoleCapabilityBuilder
    implements Builder<AccessRoleCapability, AccessRoleCapabilityBuilder> {
  _$AccessRoleCapability? _$v;

  String? _key;
  String? get key => _$this._key;
  set key(String? key) => _$this._key = key;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  String? _category;
  String? get category => _$this._category;
  set category(String? category) => _$this._category = category;

  bool? _sensitive;
  bool? get sensitive => _$this._sensitive;
  set sensitive(bool? sensitive) => _$this._sensitive = sensitive;

  bool? _systemOnly;
  bool? get systemOnly => _$this._systemOnly;
  set systemOnly(bool? systemOnly) => _$this._systemOnly = systemOnly;

  bool? _globalOnly;
  bool? get globalOnly => _$this._globalOnly;
  set globalOnly(bool? globalOnly) => _$this._globalOnly = globalOnly;

  AccessRoleCapabilityBuilder() {
    AccessRoleCapability._defaults(this);
  }

  AccessRoleCapabilityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _key = $v.key;
      _label = $v.label;
      _category = $v.category;
      _sensitive = $v.sensitive;
      _systemOnly = $v.systemOnly;
      _globalOnly = $v.globalOnly;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccessRoleCapability other) {
    _$v = other as _$AccessRoleCapability;
  }

  @override
  void update(void Function(AccessRoleCapabilityBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccessRoleCapability build() => _build();

  _$AccessRoleCapability _build() {
    final _$result =
        _$v ??
        _$AccessRoleCapability._(
          key: BuiltValueNullFieldError.checkNotNull(
            key,
            r'AccessRoleCapability',
            'key',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'AccessRoleCapability',
            'label',
          ),
          category: BuiltValueNullFieldError.checkNotNull(
            category,
            r'AccessRoleCapability',
            'category',
          ),
          sensitive: BuiltValueNullFieldError.checkNotNull(
            sensitive,
            r'AccessRoleCapability',
            'sensitive',
          ),
          systemOnly: BuiltValueNullFieldError.checkNotNull(
            systemOnly,
            r'AccessRoleCapability',
            'systemOnly',
          ),
          globalOnly: BuiltValueNullFieldError.checkNotNull(
            globalOnly,
            r'AccessRoleCapability',
            'globalOnly',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

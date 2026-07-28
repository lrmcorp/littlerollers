// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'capability_definition.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CapabilityDefinition extends CapabilityDefinition {
  @override
  final String key;
  @override
  final String label;
  @override
  final String description;
  @override
  final String category;
  @override
  final bool sensitive;
  @override
  final bool active;
  @override
  final bool systemOnly;
  @override
  final bool globalOnly;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  factory _$CapabilityDefinition([
    void Function(CapabilityDefinitionBuilder)? updates,
  ]) => (CapabilityDefinitionBuilder()..update(updates))._build();

  _$CapabilityDefinition._({
    required this.key,
    required this.label,
    required this.description,
    required this.category,
    required this.sensitive,
    required this.active,
    required this.systemOnly,
    required this.globalOnly,
    this.createdAt,
    this.updatedAt,
  }) : super._();
  @override
  CapabilityDefinition rebuild(
    void Function(CapabilityDefinitionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CapabilityDefinitionBuilder toBuilder() =>
      CapabilityDefinitionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CapabilityDefinition &&
        key == other.key &&
        label == other.label &&
        description == other.description &&
        category == other.category &&
        sensitive == other.sensitive &&
        active == other.active &&
        systemOnly == other.systemOnly &&
        globalOnly == other.globalOnly &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, key.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, sensitive.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, systemOnly.hashCode);
    _$hash = $jc(_$hash, globalOnly.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CapabilityDefinition')
          ..add('key', key)
          ..add('label', label)
          ..add('description', description)
          ..add('category', category)
          ..add('sensitive', sensitive)
          ..add('active', active)
          ..add('systemOnly', systemOnly)
          ..add('globalOnly', globalOnly)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class CapabilityDefinitionBuilder
    implements Builder<CapabilityDefinition, CapabilityDefinitionBuilder> {
  _$CapabilityDefinition? _$v;

  String? _key;
  String? get key => _$this._key;
  set key(String? key) => _$this._key = key;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  String? _category;
  String? get category => _$this._category;
  set category(String? category) => _$this._category = category;

  bool? _sensitive;
  bool? get sensitive => _$this._sensitive;
  set sensitive(bool? sensitive) => _$this._sensitive = sensitive;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  bool? _systemOnly;
  bool? get systemOnly => _$this._systemOnly;
  set systemOnly(bool? systemOnly) => _$this._systemOnly = systemOnly;

  bool? _globalOnly;
  bool? get globalOnly => _$this._globalOnly;
  set globalOnly(bool? globalOnly) => _$this._globalOnly = globalOnly;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  CapabilityDefinitionBuilder() {
    CapabilityDefinition._defaults(this);
  }

  CapabilityDefinitionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _key = $v.key;
      _label = $v.label;
      _description = $v.description;
      _category = $v.category;
      _sensitive = $v.sensitive;
      _active = $v.active;
      _systemOnly = $v.systemOnly;
      _globalOnly = $v.globalOnly;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CapabilityDefinition other) {
    _$v = other as _$CapabilityDefinition;
  }

  @override
  void update(void Function(CapabilityDefinitionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CapabilityDefinition build() => _build();

  _$CapabilityDefinition _build() {
    final _$result =
        _$v ??
        _$CapabilityDefinition._(
          key: BuiltValueNullFieldError.checkNotNull(
            key,
            r'CapabilityDefinition',
            'key',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'CapabilityDefinition',
            'label',
          ),
          description: BuiltValueNullFieldError.checkNotNull(
            description,
            r'CapabilityDefinition',
            'description',
          ),
          category: BuiltValueNullFieldError.checkNotNull(
            category,
            r'CapabilityDefinition',
            'category',
          ),
          sensitive: BuiltValueNullFieldError.checkNotNull(
            sensitive,
            r'CapabilityDefinition',
            'sensitive',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'CapabilityDefinition',
            'active',
          ),
          systemOnly: BuiltValueNullFieldError.checkNotNull(
            systemOnly,
            r'CapabilityDefinition',
            'systemOnly',
          ),
          globalOnly: BuiltValueNullFieldError.checkNotNull(
            globalOnly,
            r'CapabilityDefinition',
            'globalOnly',
          ),
          createdAt: createdAt,
          updatedAt: updatedAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

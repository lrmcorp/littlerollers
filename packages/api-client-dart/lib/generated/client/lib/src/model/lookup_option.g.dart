// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lookup_option.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LookupOption extends LookupOption {
  @override
  final String id;
  @override
  final String label;
  @override
  final String description;
  @override
  final LookupOptionMetadata metadata;

  factory _$LookupOption([void Function(LookupOptionBuilder)? updates]) =>
      (LookupOptionBuilder()..update(updates))._build();

  _$LookupOption._({
    required this.id,
    required this.label,
    required this.description,
    required this.metadata,
  }) : super._();
  @override
  LookupOption rebuild(void Function(LookupOptionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LookupOptionBuilder toBuilder() => LookupOptionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LookupOption &&
        id == other.id &&
        label == other.label &&
        description == other.description &&
        metadata == other.metadata;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, metadata.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LookupOption')
          ..add('id', id)
          ..add('label', label)
          ..add('description', description)
          ..add('metadata', metadata))
        .toString();
  }
}

class LookupOptionBuilder
    implements Builder<LookupOption, LookupOptionBuilder> {
  _$LookupOption? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  LookupOptionMetadataBuilder? _metadata;
  LookupOptionMetadataBuilder get metadata =>
      _$this._metadata ??= LookupOptionMetadataBuilder();
  set metadata(LookupOptionMetadataBuilder? metadata) =>
      _$this._metadata = metadata;

  LookupOptionBuilder() {
    LookupOption._defaults(this);
  }

  LookupOptionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _label = $v.label;
      _description = $v.description;
      _metadata = $v.metadata.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LookupOption other) {
    _$v = other as _$LookupOption;
  }

  @override
  void update(void Function(LookupOptionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LookupOption build() => _build();

  _$LookupOption _build() {
    _$LookupOption _$result;
    try {
      _$result =
          _$v ??
          _$LookupOption._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'LookupOption',
              'id',
            ),
            label: BuiltValueNullFieldError.checkNotNull(
              label,
              r'LookupOption',
              'label',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'LookupOption',
              'description',
            ),
            metadata: metadata.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'metadata';
        metadata.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'LookupOption',
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

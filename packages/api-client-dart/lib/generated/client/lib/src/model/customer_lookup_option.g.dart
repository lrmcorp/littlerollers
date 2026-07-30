// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_lookup_option.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerLookupOption extends CustomerLookupOption {
  @override
  final String id;
  @override
  final String label;
  @override
  final String description;
  @override
  final CustomerLookupOptionMetadata metadata;

  factory _$CustomerLookupOption([
    void Function(CustomerLookupOptionBuilder)? updates,
  ]) => (CustomerLookupOptionBuilder()..update(updates))._build();

  _$CustomerLookupOption._({
    required this.id,
    required this.label,
    required this.description,
    required this.metadata,
  }) : super._();
  @override
  CustomerLookupOption rebuild(
    void Function(CustomerLookupOptionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerLookupOptionBuilder toBuilder() =>
      CustomerLookupOptionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerLookupOption &&
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
    return (newBuiltValueToStringHelper(r'CustomerLookupOption')
          ..add('id', id)
          ..add('label', label)
          ..add('description', description)
          ..add('metadata', metadata))
        .toString();
  }
}

class CustomerLookupOptionBuilder
    implements Builder<CustomerLookupOption, CustomerLookupOptionBuilder> {
  _$CustomerLookupOption? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  CustomerLookupOptionMetadataBuilder? _metadata;
  CustomerLookupOptionMetadataBuilder get metadata =>
      _$this._metadata ??= CustomerLookupOptionMetadataBuilder();
  set metadata(CustomerLookupOptionMetadataBuilder? metadata) =>
      _$this._metadata = metadata;

  CustomerLookupOptionBuilder() {
    CustomerLookupOption._defaults(this);
  }

  CustomerLookupOptionBuilder get _$this {
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
  void replace(CustomerLookupOption other) {
    _$v = other as _$CustomerLookupOption;
  }

  @override
  void update(void Function(CustomerLookupOptionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerLookupOption build() => _build();

  _$CustomerLookupOption _build() {
    _$CustomerLookupOption _$result;
    try {
      _$result =
          _$v ??
          _$CustomerLookupOption._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'CustomerLookupOption',
              'id',
            ),
            label: BuiltValueNullFieldError.checkNotNull(
              label,
              r'CustomerLookupOption',
              'label',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'CustomerLookupOption',
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
          r'CustomerLookupOption',
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

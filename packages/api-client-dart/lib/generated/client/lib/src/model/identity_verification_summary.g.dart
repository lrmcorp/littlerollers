// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const IdentityVerificationSummaryStatusEnum
_$identityVerificationSummaryStatusEnum_PENDING =
    const IdentityVerificationSummaryStatusEnum._('PENDING');
const IdentityVerificationSummaryStatusEnum
_$identityVerificationSummaryStatusEnum_ACTION_REQUIRED =
    const IdentityVerificationSummaryStatusEnum._('ACTION_REQUIRED');
const IdentityVerificationSummaryStatusEnum
_$identityVerificationSummaryStatusEnum_APPROVED =
    const IdentityVerificationSummaryStatusEnum._('APPROVED');

IdentityVerificationSummaryStatusEnum
_$identityVerificationSummaryStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$identityVerificationSummaryStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$identityVerificationSummaryStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$identityVerificationSummaryStatusEnum_APPROVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationSummaryStatusEnum>
_$identityVerificationSummaryStatusEnumValues =
    BuiltSet<IdentityVerificationSummaryStatusEnum>(
      const <IdentityVerificationSummaryStatusEnum>[
        _$identityVerificationSummaryStatusEnum_PENDING,
        _$identityVerificationSummaryStatusEnum_ACTION_REQUIRED,
        _$identityVerificationSummaryStatusEnum_APPROVED,
      ],
    );

Serializer<IdentityVerificationSummaryStatusEnum>
_$identityVerificationSummaryStatusEnumSerializer =
    _$IdentityVerificationSummaryStatusEnumSerializer();

class _$IdentityVerificationSummaryStatusEnumSerializer
    implements PrimitiveSerializer<IdentityVerificationSummaryStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    IdentityVerificationSummaryStatusEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationSummaryStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationSummaryStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationSummaryStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationSummaryStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationSummary extends IdentityVerificationSummary {
  @override
  final IdentityVerificationSummaryStatusEnum status;
  @override
  final BuiltList<IdentityVerificationDocument> documents;

  factory _$IdentityVerificationSummary([
    void Function(IdentityVerificationSummaryBuilder)? updates,
  ]) => (IdentityVerificationSummaryBuilder()..update(updates))._build();

  _$IdentityVerificationSummary._({
    required this.status,
    required this.documents,
  }) : super._();
  @override
  IdentityVerificationSummary rebuild(
    void Function(IdentityVerificationSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationSummaryBuilder toBuilder() =>
      IdentityVerificationSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationSummary &&
        status == other.status &&
        documents == other.documents;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, documents.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationSummary')
          ..add('status', status)
          ..add('documents', documents))
        .toString();
  }
}

class IdentityVerificationSummaryBuilder
    implements
        Builder<
          IdentityVerificationSummary,
          IdentityVerificationSummaryBuilder
        > {
  _$IdentityVerificationSummary? _$v;

  IdentityVerificationSummaryStatusEnum? _status;
  IdentityVerificationSummaryStatusEnum? get status => _$this._status;
  set status(IdentityVerificationSummaryStatusEnum? status) =>
      _$this._status = status;

  ListBuilder<IdentityVerificationDocument>? _documents;
  ListBuilder<IdentityVerificationDocument> get documents =>
      _$this._documents ??= ListBuilder<IdentityVerificationDocument>();
  set documents(ListBuilder<IdentityVerificationDocument>? documents) =>
      _$this._documents = documents;

  IdentityVerificationSummaryBuilder() {
    IdentityVerificationSummary._defaults(this);
  }

  IdentityVerificationSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _documents = $v.documents.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationSummary other) {
    _$v = other as _$IdentityVerificationSummary;
  }

  @override
  void update(void Function(IdentityVerificationSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationSummary build() => _build();

  _$IdentityVerificationSummary _build() {
    _$IdentityVerificationSummary _$result;
    try {
      _$result =
          _$v ??
          _$IdentityVerificationSummary._(
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'IdentityVerificationSummary',
              'status',
            ),
            documents: documents.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'documents';
        documents.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'IdentityVerificationSummary',
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

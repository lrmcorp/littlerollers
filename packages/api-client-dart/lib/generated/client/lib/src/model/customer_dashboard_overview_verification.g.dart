// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_dashboard_overview_verification.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerDashboardOverviewVerificationStatusEnum
_$customerDashboardOverviewVerificationStatusEnum_PENDING =
    const CustomerDashboardOverviewVerificationStatusEnum._('PENDING');
const CustomerDashboardOverviewVerificationStatusEnum
_$customerDashboardOverviewVerificationStatusEnum_ACTION_REQUIRED =
    const CustomerDashboardOverviewVerificationStatusEnum._('ACTION_REQUIRED');
const CustomerDashboardOverviewVerificationStatusEnum
_$customerDashboardOverviewVerificationStatusEnum_APPROVED =
    const CustomerDashboardOverviewVerificationStatusEnum._('APPROVED');

CustomerDashboardOverviewVerificationStatusEnum
_$customerDashboardOverviewVerificationStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$customerDashboardOverviewVerificationStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$customerDashboardOverviewVerificationStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$customerDashboardOverviewVerificationStatusEnum_APPROVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerDashboardOverviewVerificationStatusEnum>
_$customerDashboardOverviewVerificationStatusEnumValues =
    BuiltSet<CustomerDashboardOverviewVerificationStatusEnum>(
      const <CustomerDashboardOverviewVerificationStatusEnum>[
        _$customerDashboardOverviewVerificationStatusEnum_PENDING,
        _$customerDashboardOverviewVerificationStatusEnum_ACTION_REQUIRED,
        _$customerDashboardOverviewVerificationStatusEnum_APPROVED,
      ],
    );

Serializer<CustomerDashboardOverviewVerificationStatusEnum>
_$customerDashboardOverviewVerificationStatusEnumSerializer =
    _$CustomerDashboardOverviewVerificationStatusEnumSerializer();

class _$CustomerDashboardOverviewVerificationStatusEnumSerializer
    implements
        PrimitiveSerializer<CustomerDashboardOverviewVerificationStatusEnum> {
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
    CustomerDashboardOverviewVerificationStatusEnum,
  ];
  @override
  final String wireName = 'CustomerDashboardOverviewVerificationStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewVerificationStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerDashboardOverviewVerificationStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerDashboardOverviewVerificationStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerDashboardOverviewVerification
    extends CustomerDashboardOverviewVerification {
  @override
  final CustomerDashboardOverviewVerificationStatusEnum status;
  @override
  final BuiltList<CustomerDashboardOverviewVerificationDocumentsInner>
  documents;

  factory _$CustomerDashboardOverviewVerification([
    void Function(CustomerDashboardOverviewVerificationBuilder)? updates,
  ]) => (CustomerDashboardOverviewVerificationBuilder()..update(updates))
      ._build();

  _$CustomerDashboardOverviewVerification._({
    required this.status,
    required this.documents,
  }) : super._();
  @override
  CustomerDashboardOverviewVerification rebuild(
    void Function(CustomerDashboardOverviewVerificationBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerDashboardOverviewVerificationBuilder toBuilder() =>
      CustomerDashboardOverviewVerificationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerDashboardOverviewVerification &&
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
    return (newBuiltValueToStringHelper(
            r'CustomerDashboardOverviewVerification',
          )
          ..add('status', status)
          ..add('documents', documents))
        .toString();
  }
}

class CustomerDashboardOverviewVerificationBuilder
    implements
        Builder<
          CustomerDashboardOverviewVerification,
          CustomerDashboardOverviewVerificationBuilder
        > {
  _$CustomerDashboardOverviewVerification? _$v;

  CustomerDashboardOverviewVerificationStatusEnum? _status;
  CustomerDashboardOverviewVerificationStatusEnum? get status => _$this._status;
  set status(CustomerDashboardOverviewVerificationStatusEnum? status) =>
      _$this._status = status;

  ListBuilder<CustomerDashboardOverviewVerificationDocumentsInner>? _documents;
  ListBuilder<CustomerDashboardOverviewVerificationDocumentsInner>
  get documents => _$this._documents ??=
      ListBuilder<CustomerDashboardOverviewVerificationDocumentsInner>();
  set documents(
    ListBuilder<CustomerDashboardOverviewVerificationDocumentsInner>? documents,
  ) => _$this._documents = documents;

  CustomerDashboardOverviewVerificationBuilder() {
    CustomerDashboardOverviewVerification._defaults(this);
  }

  CustomerDashboardOverviewVerificationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _documents = $v.documents.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerDashboardOverviewVerification other) {
    _$v = other as _$CustomerDashboardOverviewVerification;
  }

  @override
  void update(
    void Function(CustomerDashboardOverviewVerificationBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  CustomerDashboardOverviewVerification build() => _build();

  _$CustomerDashboardOverviewVerification _build() {
    _$CustomerDashboardOverviewVerification _$result;
    try {
      _$result =
          _$v ??
          _$CustomerDashboardOverviewVerification._(
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'CustomerDashboardOverviewVerification',
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
          r'CustomerDashboardOverviewVerification',
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

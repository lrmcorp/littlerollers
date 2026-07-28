// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_dashboard_overview_verification_documents_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum
_$customerDashboardOverviewVerificationDocumentsInnerKindEnum_SELFIE =
    const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum._(
      'SELFIE',
    );
const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum
_$customerDashboardOverviewVerificationDocumentsInnerKindEnum_KTP_FRONT =
    const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum._(
      'KTP_FRONT',
    );

CustomerDashboardOverviewVerificationDocumentsInnerKindEnum
_$customerDashboardOverviewVerificationDocumentsInnerKindEnumValueOf(
  String name,
) {
  switch (name) {
    case 'SELFIE':
      return _$customerDashboardOverviewVerificationDocumentsInnerKindEnum_SELFIE;
    case 'KTP_FRONT':
      return _$customerDashboardOverviewVerificationDocumentsInnerKindEnum_KTP_FRONT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerDashboardOverviewVerificationDocumentsInnerKindEnum>
_$customerDashboardOverviewVerificationDocumentsInnerKindEnumValues =
    BuiltSet<CustomerDashboardOverviewVerificationDocumentsInnerKindEnum>(
      const <CustomerDashboardOverviewVerificationDocumentsInnerKindEnum>[
        _$customerDashboardOverviewVerificationDocumentsInnerKindEnum_SELFIE,
        _$customerDashboardOverviewVerificationDocumentsInnerKindEnum_KTP_FRONT,
      ],
    );

Serializer<CustomerDashboardOverviewVerificationDocumentsInnerKindEnum>
_$customerDashboardOverviewVerificationDocumentsInnerKindEnumSerializer =
    _$CustomerDashboardOverviewVerificationDocumentsInnerKindEnumSerializer();

class _$CustomerDashboardOverviewVerificationDocumentsInnerKindEnumSerializer
    implements
        PrimitiveSerializer<
          CustomerDashboardOverviewVerificationDocumentsInnerKindEnum
        > {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SELFIE': 'SELFIE',
    'KTP_FRONT': 'KTP_FRONT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SELFIE': 'SELFIE',
    'KTP_FRONT': 'KTP_FRONT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerDashboardOverviewVerificationDocumentsInnerKindEnum,
  ];
  @override
  final String wireName =
      'CustomerDashboardOverviewVerificationDocumentsInnerKindEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewVerificationDocumentsInnerKindEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerDashboardOverviewVerificationDocumentsInnerKindEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerDashboardOverviewVerificationDocumentsInnerKindEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerDashboardOverviewVerificationDocumentsInner
    extends CustomerDashboardOverviewVerificationDocumentsInner {
  @override
  final CustomerDashboardOverviewVerificationDocumentsInnerKindEnum kind;
  @override
  final String status;
  @override
  final DateTime updatedAt;

  factory _$CustomerDashboardOverviewVerificationDocumentsInner([
    void Function(CustomerDashboardOverviewVerificationDocumentsInnerBuilder)?
    updates,
  ]) =>
      (CustomerDashboardOverviewVerificationDocumentsInnerBuilder()
            ..update(updates))
          ._build();

  _$CustomerDashboardOverviewVerificationDocumentsInner._({
    required this.kind,
    required this.status,
    required this.updatedAt,
  }) : super._();
  @override
  CustomerDashboardOverviewVerificationDocumentsInner rebuild(
    void Function(CustomerDashboardOverviewVerificationDocumentsInnerBuilder)
    updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerDashboardOverviewVerificationDocumentsInnerBuilder toBuilder() =>
      CustomerDashboardOverviewVerificationDocumentsInnerBuilder()
        ..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerDashboardOverviewVerificationDocumentsInner &&
        kind == other.kind &&
        status == other.status &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'CustomerDashboardOverviewVerificationDocumentsInner',
          )
          ..add('kind', kind)
          ..add('status', status)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class CustomerDashboardOverviewVerificationDocumentsInnerBuilder
    implements
        Builder<
          CustomerDashboardOverviewVerificationDocumentsInner,
          CustomerDashboardOverviewVerificationDocumentsInnerBuilder
        > {
  _$CustomerDashboardOverviewVerificationDocumentsInner? _$v;

  CustomerDashboardOverviewVerificationDocumentsInnerKindEnum? _kind;
  CustomerDashboardOverviewVerificationDocumentsInnerKindEnum? get kind =>
      _$this._kind;
  set kind(CustomerDashboardOverviewVerificationDocumentsInnerKindEnum? kind) =>
      _$this._kind = kind;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  CustomerDashboardOverviewVerificationDocumentsInnerBuilder() {
    CustomerDashboardOverviewVerificationDocumentsInner._defaults(this);
  }

  CustomerDashboardOverviewVerificationDocumentsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _kind = $v.kind;
      _status = $v.status;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerDashboardOverviewVerificationDocumentsInner other) {
    _$v = other as _$CustomerDashboardOverviewVerificationDocumentsInner;
  }

  @override
  void update(
    void Function(CustomerDashboardOverviewVerificationDocumentsInnerBuilder)?
    updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  CustomerDashboardOverviewVerificationDocumentsInner build() => _build();

  _$CustomerDashboardOverviewVerificationDocumentsInner _build() {
    final _$result =
        _$v ??
        _$CustomerDashboardOverviewVerificationDocumentsInner._(
          kind: BuiltValueNullFieldError.checkNotNull(
            kind,
            r'CustomerDashboardOverviewVerificationDocumentsInner',
            'kind',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CustomerDashboardOverviewVerificationDocumentsInner',
            'status',
          ),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
            updatedAt,
            r'CustomerDashboardOverviewVerificationDocumentsInner',
            'updatedAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

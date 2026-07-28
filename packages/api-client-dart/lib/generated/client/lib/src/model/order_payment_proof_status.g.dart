// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_payment_proof_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OrderPaymentProofStatusUploadStatusEnum
_$orderPaymentProofStatusUploadStatusEnum_ISSUED =
    const OrderPaymentProofStatusUploadStatusEnum._('ISSUED');
const OrderPaymentProofStatusUploadStatusEnum
_$orderPaymentProofStatusUploadStatusEnum_UPLOADED =
    const OrderPaymentProofStatusUploadStatusEnum._('UPLOADED');
const OrderPaymentProofStatusUploadStatusEnum
_$orderPaymentProofStatusUploadStatusEnum_FINALIZED =
    const OrderPaymentProofStatusUploadStatusEnum._('FINALIZED');
const OrderPaymentProofStatusUploadStatusEnum
_$orderPaymentProofStatusUploadStatusEnum_FAILED =
    const OrderPaymentProofStatusUploadStatusEnum._('FAILED');

OrderPaymentProofStatusUploadStatusEnum
_$orderPaymentProofStatusUploadStatusEnumValueOf(String name) {
  switch (name) {
    case 'ISSUED':
      return _$orderPaymentProofStatusUploadStatusEnum_ISSUED;
    case 'UPLOADED':
      return _$orderPaymentProofStatusUploadStatusEnum_UPLOADED;
    case 'FINALIZED':
      return _$orderPaymentProofStatusUploadStatusEnum_FINALIZED;
    case 'FAILED':
      return _$orderPaymentProofStatusUploadStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OrderPaymentProofStatusUploadStatusEnum>
_$orderPaymentProofStatusUploadStatusEnumValues =
    BuiltSet<OrderPaymentProofStatusUploadStatusEnum>(
      const <OrderPaymentProofStatusUploadStatusEnum>[
        _$orderPaymentProofStatusUploadStatusEnum_ISSUED,
        _$orderPaymentProofStatusUploadStatusEnum_UPLOADED,
        _$orderPaymentProofStatusUploadStatusEnum_FINALIZED,
        _$orderPaymentProofStatusUploadStatusEnum_FAILED,
      ],
    );

const OrderPaymentProofStatusScanStatusEnum
_$orderPaymentProofStatusScanStatusEnum_PENDING =
    const OrderPaymentProofStatusScanStatusEnum._('PENDING');
const OrderPaymentProofStatusScanStatusEnum
_$orderPaymentProofStatusScanStatusEnum_CLEAN =
    const OrderPaymentProofStatusScanStatusEnum._('CLEAN');
const OrderPaymentProofStatusScanStatusEnum
_$orderPaymentProofStatusScanStatusEnum_REJECTED =
    const OrderPaymentProofStatusScanStatusEnum._('REJECTED');
const OrderPaymentProofStatusScanStatusEnum
_$orderPaymentProofStatusScanStatusEnum_INFECTED =
    const OrderPaymentProofStatusScanStatusEnum._('INFECTED');
const OrderPaymentProofStatusScanStatusEnum
_$orderPaymentProofStatusScanStatusEnum_ERROR =
    const OrderPaymentProofStatusScanStatusEnum._('ERROR');

OrderPaymentProofStatusScanStatusEnum
_$orderPaymentProofStatusScanStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$orderPaymentProofStatusScanStatusEnum_PENDING;
    case 'CLEAN':
      return _$orderPaymentProofStatusScanStatusEnum_CLEAN;
    case 'REJECTED':
      return _$orderPaymentProofStatusScanStatusEnum_REJECTED;
    case 'INFECTED':
      return _$orderPaymentProofStatusScanStatusEnum_INFECTED;
    case 'ERROR':
      return _$orderPaymentProofStatusScanStatusEnum_ERROR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OrderPaymentProofStatusScanStatusEnum>
_$orderPaymentProofStatusScanStatusEnumValues =
    BuiltSet<OrderPaymentProofStatusScanStatusEnum>(
      const <OrderPaymentProofStatusScanStatusEnum>[
        _$orderPaymentProofStatusScanStatusEnum_PENDING,
        _$orderPaymentProofStatusScanStatusEnum_CLEAN,
        _$orderPaymentProofStatusScanStatusEnum_REJECTED,
        _$orderPaymentProofStatusScanStatusEnum_INFECTED,
        _$orderPaymentProofStatusScanStatusEnum_ERROR,
      ],
    );

Serializer<OrderPaymentProofStatusUploadStatusEnum>
_$orderPaymentProofStatusUploadStatusEnumSerializer =
    _$OrderPaymentProofStatusUploadStatusEnumSerializer();
Serializer<OrderPaymentProofStatusScanStatusEnum>
_$orderPaymentProofStatusScanStatusEnumSerializer =
    _$OrderPaymentProofStatusScanStatusEnumSerializer();

class _$OrderPaymentProofStatusUploadStatusEnumSerializer
    implements PrimitiveSerializer<OrderPaymentProofStatusUploadStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ISSUED': 'ISSUED',
    'UPLOADED': 'UPLOADED',
    'FINALIZED': 'FINALIZED',
    'FAILED': 'FAILED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ISSUED': 'ISSUED',
    'UPLOADED': 'UPLOADED',
    'FINALIZED': 'FINALIZED',
    'FAILED': 'FAILED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OrderPaymentProofStatusUploadStatusEnum,
  ];
  @override
  final String wireName = 'OrderPaymentProofStatusUploadStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    OrderPaymentProofStatusUploadStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OrderPaymentProofStatusUploadStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OrderPaymentProofStatusUploadStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$OrderPaymentProofStatusScanStatusEnumSerializer
    implements PrimitiveSerializer<OrderPaymentProofStatusScanStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'CLEAN': 'CLEAN',
    'REJECTED': 'REJECTED',
    'INFECTED': 'INFECTED',
    'ERROR': 'ERROR',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'CLEAN': 'CLEAN',
    'REJECTED': 'REJECTED',
    'INFECTED': 'INFECTED',
    'ERROR': 'ERROR',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OrderPaymentProofStatusScanStatusEnum,
  ];
  @override
  final String wireName = 'OrderPaymentProofStatusScanStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    OrderPaymentProofStatusScanStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OrderPaymentProofStatusScanStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OrderPaymentProofStatusScanStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$OrderPaymentProofStatus extends OrderPaymentProofStatus {
  @override
  final OrderPaymentProofStatusUploadStatusEnum? uploadStatus;
  @override
  final OrderPaymentProofStatusScanStatusEnum? scanStatus;

  factory _$OrderPaymentProofStatus([
    void Function(OrderPaymentProofStatusBuilder)? updates,
  ]) => (OrderPaymentProofStatusBuilder()..update(updates))._build();

  _$OrderPaymentProofStatus._({this.uploadStatus, this.scanStatus}) : super._();
  @override
  OrderPaymentProofStatus rebuild(
    void Function(OrderPaymentProofStatusBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  OrderPaymentProofStatusBuilder toBuilder() =>
      OrderPaymentProofStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderPaymentProofStatus &&
        uploadStatus == other.uploadStatus &&
        scanStatus == other.scanStatus;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, uploadStatus.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderPaymentProofStatus')
          ..add('uploadStatus', uploadStatus)
          ..add('scanStatus', scanStatus))
        .toString();
  }
}

class OrderPaymentProofStatusBuilder
    implements
        Builder<OrderPaymentProofStatus, OrderPaymentProofStatusBuilder> {
  _$OrderPaymentProofStatus? _$v;

  OrderPaymentProofStatusUploadStatusEnum? _uploadStatus;
  OrderPaymentProofStatusUploadStatusEnum? get uploadStatus =>
      _$this._uploadStatus;
  set uploadStatus(OrderPaymentProofStatusUploadStatusEnum? uploadStatus) =>
      _$this._uploadStatus = uploadStatus;

  OrderPaymentProofStatusScanStatusEnum? _scanStatus;
  OrderPaymentProofStatusScanStatusEnum? get scanStatus => _$this._scanStatus;
  set scanStatus(OrderPaymentProofStatusScanStatusEnum? scanStatus) =>
      _$this._scanStatus = scanStatus;

  OrderPaymentProofStatusBuilder() {
    OrderPaymentProofStatus._defaults(this);
  }

  OrderPaymentProofStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _uploadStatus = $v.uploadStatus;
      _scanStatus = $v.scanStatus;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderPaymentProofStatus other) {
    _$v = other as _$OrderPaymentProofStatus;
  }

  @override
  void update(void Function(OrderPaymentProofStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderPaymentProofStatus build() => _build();

  _$OrderPaymentProofStatus _build() {
    final _$result =
        _$v ??
        _$OrderPaymentProofStatus._(
          uploadStatus: uploadStatus,
          scanStatus: scanStatus,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

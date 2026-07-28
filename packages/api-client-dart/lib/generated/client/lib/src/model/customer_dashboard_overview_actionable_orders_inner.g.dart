// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_dashboard_overview_actionable_orders_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerDashboardOverviewActionableOrdersInnerStatusEnum
_$customerDashboardOverviewActionableOrdersInnerStatusEnum_AWAITING_PAYMENT =
    const CustomerDashboardOverviewActionableOrdersInnerStatusEnum._(
      'AWAITING_PAYMENT',
    );
const CustomerDashboardOverviewActionableOrdersInnerStatusEnum
_$customerDashboardOverviewActionableOrdersInnerStatusEnum_PENDING =
    const CustomerDashboardOverviewActionableOrdersInnerStatusEnum._('PENDING');
const CustomerDashboardOverviewActionableOrdersInnerStatusEnum
_$customerDashboardOverviewActionableOrdersInnerStatusEnum_ACTION_REQUIRED =
    const CustomerDashboardOverviewActionableOrdersInnerStatusEnum._(
      'ACTION_REQUIRED',
    );

CustomerDashboardOverviewActionableOrdersInnerStatusEnum
_$customerDashboardOverviewActionableOrdersInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'AWAITING_PAYMENT':
      return _$customerDashboardOverviewActionableOrdersInnerStatusEnum_AWAITING_PAYMENT;
    case 'PENDING':
      return _$customerDashboardOverviewActionableOrdersInnerStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$customerDashboardOverviewActionableOrdersInnerStatusEnum_ACTION_REQUIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerDashboardOverviewActionableOrdersInnerStatusEnum>
_$customerDashboardOverviewActionableOrdersInnerStatusEnumValues =
    BuiltSet<CustomerDashboardOverviewActionableOrdersInnerStatusEnum>(const <
      CustomerDashboardOverviewActionableOrdersInnerStatusEnum
    >[
      _$customerDashboardOverviewActionableOrdersInnerStatusEnum_AWAITING_PAYMENT,
      _$customerDashboardOverviewActionableOrdersInnerStatusEnum_PENDING,
      _$customerDashboardOverviewActionableOrdersInnerStatusEnum_ACTION_REQUIRED,
    ]);

Serializer<CustomerDashboardOverviewActionableOrdersInnerStatusEnum>
_$customerDashboardOverviewActionableOrdersInnerStatusEnumSerializer =
    _$CustomerDashboardOverviewActionableOrdersInnerStatusEnumSerializer();

class _$CustomerDashboardOverviewActionableOrdersInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<
          CustomerDashboardOverviewActionableOrdersInnerStatusEnum
        > {
  static const Map<String, Object> _toWire = const <String, Object>{
    'AWAITING_PAYMENT': 'AWAITING_PAYMENT',
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'AWAITING_PAYMENT': 'AWAITING_PAYMENT',
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerDashboardOverviewActionableOrdersInnerStatusEnum,
  ];
  @override
  final String wireName =
      'CustomerDashboardOverviewActionableOrdersInnerStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewActionableOrdersInnerStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerDashboardOverviewActionableOrdersInnerStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerDashboardOverviewActionableOrdersInnerStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerDashboardOverviewActionableOrdersInner
    extends CustomerDashboardOverviewActionableOrdersInner {
  @override
  final String id;
  @override
  final String packageName;
  @override
  final String branchName;
  @override
  final CustomerDashboardOverviewActionableOrdersInnerStatusEnum status;
  @override
  final int payableAmountRp;
  @override
  final DateTime? expiresAt;

  factory _$CustomerDashboardOverviewActionableOrdersInner([
    void Function(CustomerDashboardOverviewActionableOrdersInnerBuilder)?
    updates,
  ]) =>
      (CustomerDashboardOverviewActionableOrdersInnerBuilder()..update(updates))
          ._build();

  _$CustomerDashboardOverviewActionableOrdersInner._({
    required this.id,
    required this.packageName,
    required this.branchName,
    required this.status,
    required this.payableAmountRp,
    this.expiresAt,
  }) : super._();
  @override
  CustomerDashboardOverviewActionableOrdersInner rebuild(
    void Function(CustomerDashboardOverviewActionableOrdersInnerBuilder)
    updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerDashboardOverviewActionableOrdersInnerBuilder toBuilder() =>
      CustomerDashboardOverviewActionableOrdersInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerDashboardOverviewActionableOrdersInner &&
        id == other.id &&
        packageName == other.packageName &&
        branchName == other.branchName &&
        status == other.status &&
        payableAmountRp == other.payableAmountRp &&
        expiresAt == other.expiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, packageName.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, payableAmountRp.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'CustomerDashboardOverviewActionableOrdersInner',
          )
          ..add('id', id)
          ..add('packageName', packageName)
          ..add('branchName', branchName)
          ..add('status', status)
          ..add('payableAmountRp', payableAmountRp)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class CustomerDashboardOverviewActionableOrdersInnerBuilder
    implements
        Builder<
          CustomerDashboardOverviewActionableOrdersInner,
          CustomerDashboardOverviewActionableOrdersInnerBuilder
        > {
  _$CustomerDashboardOverviewActionableOrdersInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _packageName;
  String? get packageName => _$this._packageName;
  set packageName(String? packageName) => _$this._packageName = packageName;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  CustomerDashboardOverviewActionableOrdersInnerStatusEnum? _status;
  CustomerDashboardOverviewActionableOrdersInnerStatusEnum? get status =>
      _$this._status;
  set status(
    CustomerDashboardOverviewActionableOrdersInnerStatusEnum? status,
  ) => _$this._status = status;

  int? _payableAmountRp;
  int? get payableAmountRp => _$this._payableAmountRp;
  set payableAmountRp(int? payableAmountRp) =>
      _$this._payableAmountRp = payableAmountRp;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  CustomerDashboardOverviewActionableOrdersInnerBuilder() {
    CustomerDashboardOverviewActionableOrdersInner._defaults(this);
  }

  CustomerDashboardOverviewActionableOrdersInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _packageName = $v.packageName;
      _branchName = $v.branchName;
      _status = $v.status;
      _payableAmountRp = $v.payableAmountRp;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerDashboardOverviewActionableOrdersInner other) {
    _$v = other as _$CustomerDashboardOverviewActionableOrdersInner;
  }

  @override
  void update(
    void Function(CustomerDashboardOverviewActionableOrdersInnerBuilder)?
    updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  CustomerDashboardOverviewActionableOrdersInner build() => _build();

  _$CustomerDashboardOverviewActionableOrdersInner _build() {
    final _$result =
        _$v ??
        _$CustomerDashboardOverviewActionableOrdersInner._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerDashboardOverviewActionableOrdersInner',
            'id',
          ),
          packageName: BuiltValueNullFieldError.checkNotNull(
            packageName,
            r'CustomerDashboardOverviewActionableOrdersInner',
            'packageName',
          ),
          branchName: BuiltValueNullFieldError.checkNotNull(
            branchName,
            r'CustomerDashboardOverviewActionableOrdersInner',
            'branchName',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CustomerDashboardOverviewActionableOrdersInner',
            'status',
          ),
          payableAmountRp: BuiltValueNullFieldError.checkNotNull(
            payableAmountRp,
            r'CustomerDashboardOverviewActionableOrdersInner',
            'payableAmountRp',
          ),
          expiresAt: expiresAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

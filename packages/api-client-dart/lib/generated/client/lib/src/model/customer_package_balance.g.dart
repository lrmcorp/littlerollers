// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_package_balance.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerPackageBalanceStatusEnum
_$customerPackageBalanceStatusEnum_ACTIVE =
    const CustomerPackageBalanceStatusEnum._('ACTIVE');
const CustomerPackageBalanceStatusEnum
_$customerPackageBalanceStatusEnum_EXPIRED =
    const CustomerPackageBalanceStatusEnum._('EXPIRED');
const CustomerPackageBalanceStatusEnum
_$customerPackageBalanceStatusEnum_INACTIVE =
    const CustomerPackageBalanceStatusEnum._('INACTIVE');

CustomerPackageBalanceStatusEnum _$customerPackageBalanceStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$customerPackageBalanceStatusEnum_ACTIVE;
    case 'EXPIRED':
      return _$customerPackageBalanceStatusEnum_EXPIRED;
    case 'INACTIVE':
      return _$customerPackageBalanceStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerPackageBalanceStatusEnum>
_$customerPackageBalanceStatusEnumValues =
    BuiltSet<CustomerPackageBalanceStatusEnum>(
      const <CustomerPackageBalanceStatusEnum>[
        _$customerPackageBalanceStatusEnum_ACTIVE,
        _$customerPackageBalanceStatusEnum_EXPIRED,
        _$customerPackageBalanceStatusEnum_INACTIVE,
      ],
    );

Serializer<CustomerPackageBalanceStatusEnum>
_$customerPackageBalanceStatusEnumSerializer =
    _$CustomerPackageBalanceStatusEnumSerializer();

class _$CustomerPackageBalanceStatusEnumSerializer
    implements PrimitiveSerializer<CustomerPackageBalanceStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'EXPIRED': 'EXPIRED',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'EXPIRED': 'EXPIRED',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[CustomerPackageBalanceStatusEnum];
  @override
  final String wireName = 'CustomerPackageBalanceStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerPackageBalanceStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerPackageBalanceStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerPackageBalanceStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerPackageBalance extends CustomerPackageBalance {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String customerUserId;
  @override
  final String packageId;
  @override
  final String classTypeId;
  @override
  final CustomerPackageBalanceStatusEnum status;
  @override
  final Date activationDate;
  @override
  final DateTime expiryAt;
  @override
  final int ledgerBalance;
  @override
  final int reserved;
  @override
  final int available;
  @override
  final int salePriceRp;
  @override
  final int sessionCountSnapshot;
  @override
  final int durationDaysSnapshot;
  @override
  final int projectionRateRp;
  @override
  final int version;

  factory _$CustomerPackageBalance([
    void Function(CustomerPackageBalanceBuilder)? updates,
  ]) => (CustomerPackageBalanceBuilder()..update(updates))._build();

  _$CustomerPackageBalance._({
    required this.id,
    required this.branchId,
    required this.customerUserId,
    required this.packageId,
    required this.classTypeId,
    required this.status,
    required this.activationDate,
    required this.expiryAt,
    required this.ledgerBalance,
    required this.reserved,
    required this.available,
    required this.salePriceRp,
    required this.sessionCountSnapshot,
    required this.durationDaysSnapshot,
    required this.projectionRateRp,
    required this.version,
  }) : super._();
  @override
  CustomerPackageBalance rebuild(
    void Function(CustomerPackageBalanceBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerPackageBalanceBuilder toBuilder() =>
      CustomerPackageBalanceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerPackageBalance &&
        id == other.id &&
        branchId == other.branchId &&
        customerUserId == other.customerUserId &&
        packageId == other.packageId &&
        classTypeId == other.classTypeId &&
        status == other.status &&
        activationDate == other.activationDate &&
        expiryAt == other.expiryAt &&
        ledgerBalance == other.ledgerBalance &&
        reserved == other.reserved &&
        available == other.available &&
        salePriceRp == other.salePriceRp &&
        sessionCountSnapshot == other.sessionCountSnapshot &&
        durationDaysSnapshot == other.durationDaysSnapshot &&
        projectionRateRp == other.projectionRateRp &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, customerUserId.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, activationDate.hashCode);
    _$hash = $jc(_$hash, expiryAt.hashCode);
    _$hash = $jc(_$hash, ledgerBalance.hashCode);
    _$hash = $jc(_$hash, reserved.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jc(_$hash, salePriceRp.hashCode);
    _$hash = $jc(_$hash, sessionCountSnapshot.hashCode);
    _$hash = $jc(_$hash, durationDaysSnapshot.hashCode);
    _$hash = $jc(_$hash, projectionRateRp.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerPackageBalance')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('customerUserId', customerUserId)
          ..add('packageId', packageId)
          ..add('classTypeId', classTypeId)
          ..add('status', status)
          ..add('activationDate', activationDate)
          ..add('expiryAt', expiryAt)
          ..add('ledgerBalance', ledgerBalance)
          ..add('reserved', reserved)
          ..add('available', available)
          ..add('salePriceRp', salePriceRp)
          ..add('sessionCountSnapshot', sessionCountSnapshot)
          ..add('durationDaysSnapshot', durationDaysSnapshot)
          ..add('projectionRateRp', projectionRateRp)
          ..add('version', version))
        .toString();
  }
}

class CustomerPackageBalanceBuilder
    implements Builder<CustomerPackageBalance, CustomerPackageBalanceBuilder> {
  _$CustomerPackageBalance? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _customerUserId;
  String? get customerUserId => _$this._customerUserId;
  set customerUserId(String? customerUserId) =>
      _$this._customerUserId = customerUserId;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  CustomerPackageBalanceStatusEnum? _status;
  CustomerPackageBalanceStatusEnum? get status => _$this._status;
  set status(CustomerPackageBalanceStatusEnum? status) =>
      _$this._status = status;

  Date? _activationDate;
  Date? get activationDate => _$this._activationDate;
  set activationDate(Date? activationDate) =>
      _$this._activationDate = activationDate;

  DateTime? _expiryAt;
  DateTime? get expiryAt => _$this._expiryAt;
  set expiryAt(DateTime? expiryAt) => _$this._expiryAt = expiryAt;

  int? _ledgerBalance;
  int? get ledgerBalance => _$this._ledgerBalance;
  set ledgerBalance(int? ledgerBalance) =>
      _$this._ledgerBalance = ledgerBalance;

  int? _reserved;
  int? get reserved => _$this._reserved;
  set reserved(int? reserved) => _$this._reserved = reserved;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  int? _salePriceRp;
  int? get salePriceRp => _$this._salePriceRp;
  set salePriceRp(int? salePriceRp) => _$this._salePriceRp = salePriceRp;

  int? _sessionCountSnapshot;
  int? get sessionCountSnapshot => _$this._sessionCountSnapshot;
  set sessionCountSnapshot(int? sessionCountSnapshot) =>
      _$this._sessionCountSnapshot = sessionCountSnapshot;

  int? _durationDaysSnapshot;
  int? get durationDaysSnapshot => _$this._durationDaysSnapshot;
  set durationDaysSnapshot(int? durationDaysSnapshot) =>
      _$this._durationDaysSnapshot = durationDaysSnapshot;

  int? _projectionRateRp;
  int? get projectionRateRp => _$this._projectionRateRp;
  set projectionRateRp(int? projectionRateRp) =>
      _$this._projectionRateRp = projectionRateRp;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  CustomerPackageBalanceBuilder() {
    CustomerPackageBalance._defaults(this);
  }

  CustomerPackageBalanceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _customerUserId = $v.customerUserId;
      _packageId = $v.packageId;
      _classTypeId = $v.classTypeId;
      _status = $v.status;
      _activationDate = $v.activationDate;
      _expiryAt = $v.expiryAt;
      _ledgerBalance = $v.ledgerBalance;
      _reserved = $v.reserved;
      _available = $v.available;
      _salePriceRp = $v.salePriceRp;
      _sessionCountSnapshot = $v.sessionCountSnapshot;
      _durationDaysSnapshot = $v.durationDaysSnapshot;
      _projectionRateRp = $v.projectionRateRp;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerPackageBalance other) {
    _$v = other as _$CustomerPackageBalance;
  }

  @override
  void update(void Function(CustomerPackageBalanceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerPackageBalance build() => _build();

  _$CustomerPackageBalance _build() {
    final _$result =
        _$v ??
        _$CustomerPackageBalance._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerPackageBalance',
            'id',
          ),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'CustomerPackageBalance',
            'branchId',
          ),
          customerUserId: BuiltValueNullFieldError.checkNotNull(
            customerUserId,
            r'CustomerPackageBalance',
            'customerUserId',
          ),
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'CustomerPackageBalance',
            'packageId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'CustomerPackageBalance',
            'classTypeId',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CustomerPackageBalance',
            'status',
          ),
          activationDate: BuiltValueNullFieldError.checkNotNull(
            activationDate,
            r'CustomerPackageBalance',
            'activationDate',
          ),
          expiryAt: BuiltValueNullFieldError.checkNotNull(
            expiryAt,
            r'CustomerPackageBalance',
            'expiryAt',
          ),
          ledgerBalance: BuiltValueNullFieldError.checkNotNull(
            ledgerBalance,
            r'CustomerPackageBalance',
            'ledgerBalance',
          ),
          reserved: BuiltValueNullFieldError.checkNotNull(
            reserved,
            r'CustomerPackageBalance',
            'reserved',
          ),
          available: BuiltValueNullFieldError.checkNotNull(
            available,
            r'CustomerPackageBalance',
            'available',
          ),
          salePriceRp: BuiltValueNullFieldError.checkNotNull(
            salePriceRp,
            r'CustomerPackageBalance',
            'salePriceRp',
          ),
          sessionCountSnapshot: BuiltValueNullFieldError.checkNotNull(
            sessionCountSnapshot,
            r'CustomerPackageBalance',
            'sessionCountSnapshot',
          ),
          durationDaysSnapshot: BuiltValueNullFieldError.checkNotNull(
            durationDaysSnapshot,
            r'CustomerPackageBalance',
            'durationDaysSnapshot',
          ),
          projectionRateRp: BuiltValueNullFieldError.checkNotNull(
            projectionRateRp,
            r'CustomerPackageBalance',
            'projectionRateRp',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'CustomerPackageBalance',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_lookup_option_metadata.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerLookupOptionMetadataVerificationStatusEnum
_$customerLookupOptionMetadataVerificationStatusEnum_APPROVED =
    const CustomerLookupOptionMetadataVerificationStatusEnum._('APPROVED');

CustomerLookupOptionMetadataVerificationStatusEnum
_$customerLookupOptionMetadataVerificationStatusEnumValueOf(String name) {
  switch (name) {
    case 'APPROVED':
      return _$customerLookupOptionMetadataVerificationStatusEnum_APPROVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerLookupOptionMetadataVerificationStatusEnum>
_$customerLookupOptionMetadataVerificationStatusEnumValues =
    BuiltSet<CustomerLookupOptionMetadataVerificationStatusEnum>(
      const <CustomerLookupOptionMetadataVerificationStatusEnum>[
        _$customerLookupOptionMetadataVerificationStatusEnum_APPROVED,
      ],
    );

Serializer<CustomerLookupOptionMetadataVerificationStatusEnum>
_$customerLookupOptionMetadataVerificationStatusEnumSerializer =
    _$CustomerLookupOptionMetadataVerificationStatusEnumSerializer();

class _$CustomerLookupOptionMetadataVerificationStatusEnumSerializer
    implements
        PrimitiveSerializer<
          CustomerLookupOptionMetadataVerificationStatusEnum
        > {
  static const Map<String, Object> _toWire = const <String, Object>{
    'APPROVED': 'APPROVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'APPROVED': 'APPROVED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerLookupOptionMetadataVerificationStatusEnum,
  ];
  @override
  final String wireName = 'CustomerLookupOptionMetadataVerificationStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerLookupOptionMetadataVerificationStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerLookupOptionMetadataVerificationStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerLookupOptionMetadataVerificationStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerLookupOptionMetadata extends CustomerLookupOptionMetadata {
  @override
  final CustomerLookupOptionMetadataVerificationStatusEnum verificationStatus;
  @override
  final int eligiblePackageCount;
  @override
  final String branchId;

  factory _$CustomerLookupOptionMetadata([
    void Function(CustomerLookupOptionMetadataBuilder)? updates,
  ]) => (CustomerLookupOptionMetadataBuilder()..update(updates))._build();

  _$CustomerLookupOptionMetadata._({
    required this.verificationStatus,
    required this.eligiblePackageCount,
    required this.branchId,
  }) : super._();
  @override
  CustomerLookupOptionMetadata rebuild(
    void Function(CustomerLookupOptionMetadataBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerLookupOptionMetadataBuilder toBuilder() =>
      CustomerLookupOptionMetadataBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerLookupOptionMetadata &&
        verificationStatus == other.verificationStatus &&
        eligiblePackageCount == other.eligiblePackageCount &&
        branchId == other.branchId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, verificationStatus.hashCode);
    _$hash = $jc(_$hash, eligiblePackageCount.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerLookupOptionMetadata')
          ..add('verificationStatus', verificationStatus)
          ..add('eligiblePackageCount', eligiblePackageCount)
          ..add('branchId', branchId))
        .toString();
  }
}

class CustomerLookupOptionMetadataBuilder
    implements
        Builder<
          CustomerLookupOptionMetadata,
          CustomerLookupOptionMetadataBuilder
        > {
  _$CustomerLookupOptionMetadata? _$v;

  CustomerLookupOptionMetadataVerificationStatusEnum? _verificationStatus;
  CustomerLookupOptionMetadataVerificationStatusEnum? get verificationStatus =>
      _$this._verificationStatus;
  set verificationStatus(
    CustomerLookupOptionMetadataVerificationStatusEnum? verificationStatus,
  ) => _$this._verificationStatus = verificationStatus;

  int? _eligiblePackageCount;
  int? get eligiblePackageCount => _$this._eligiblePackageCount;
  set eligiblePackageCount(int? eligiblePackageCount) =>
      _$this._eligiblePackageCount = eligiblePackageCount;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  CustomerLookupOptionMetadataBuilder() {
    CustomerLookupOptionMetadata._defaults(this);
  }

  CustomerLookupOptionMetadataBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _verificationStatus = $v.verificationStatus;
      _eligiblePackageCount = $v.eligiblePackageCount;
      _branchId = $v.branchId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerLookupOptionMetadata other) {
    _$v = other as _$CustomerLookupOptionMetadata;
  }

  @override
  void update(void Function(CustomerLookupOptionMetadataBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerLookupOptionMetadata build() => _build();

  _$CustomerLookupOptionMetadata _build() {
    final _$result =
        _$v ??
        _$CustomerLookupOptionMetadata._(
          verificationStatus: BuiltValueNullFieldError.checkNotNull(
            verificationStatus,
            r'CustomerLookupOptionMetadata',
            'verificationStatus',
          ),
          eligiblePackageCount: BuiltValueNullFieldError.checkNotNull(
            eligiblePackageCount,
            r'CustomerLookupOptionMetadata',
            'eligiblePackageCount',
          ),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'CustomerLookupOptionMetadata',
            'branchId',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

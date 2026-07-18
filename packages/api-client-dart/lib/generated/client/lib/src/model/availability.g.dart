// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'availability.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AvailabilityStatusEnum _$availabilityStatusEnum_ACTIVE =
    const AvailabilityStatusEnum._('ACTIVE');
const AvailabilityStatusEnum _$availabilityStatusEnum_ENDED =
    const AvailabilityStatusEnum._('ENDED');

AvailabilityStatusEnum _$availabilityStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$availabilityStatusEnum_ACTIVE;
    case 'ENDED':
      return _$availabilityStatusEnum_ENDED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AvailabilityStatusEnum> _$availabilityStatusEnumValues =
    BuiltSet<AvailabilityStatusEnum>(const <AvailabilityStatusEnum>[
      _$availabilityStatusEnum_ACTIVE,
      _$availabilityStatusEnum_ENDED,
    ]);

Serializer<AvailabilityStatusEnum> _$availabilityStatusEnumSerializer =
    _$AvailabilityStatusEnumSerializer();

class _$AvailabilityStatusEnumSerializer
    implements PrimitiveSerializer<AvailabilityStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'ENDED': 'ENDED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'ENDED': 'ENDED',
  };

  @override
  final Iterable<Type> types = const <Type>[AvailabilityStatusEnum];
  @override
  final String wireName = 'AvailabilityStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    AvailabilityStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AvailabilityStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AvailabilityStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Availability extends Availability {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String instructorUserId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;
  @override
  final String timezone;
  @override
  final AvailabilityStatusEnum status;
  @override
  final int version;

  factory _$Availability([void Function(AvailabilityBuilder)? updates]) =>
      (AvailabilityBuilder()..update(updates))._build();

  _$Availability._({
    required this.id,
    required this.branchId,
    required this.instructorUserId,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
    required this.version,
  }) : super._();
  @override
  Availability rebuild(void Function(AvailabilityBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AvailabilityBuilder toBuilder() => AvailabilityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Availability &&
        id == other.id &&
        branchId == other.branchId &&
        instructorUserId == other.instructorUserId &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        timezone == other.timezone &&
        status == other.status &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Availability')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('instructorUserId', instructorUserId)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('timezone', timezone)
          ..add('status', status)
          ..add('version', version))
        .toString();
  }
}

class AvailabilityBuilder
    implements Builder<Availability, AvailabilityBuilder> {
  _$Availability? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  AvailabilityStatusEnum? _status;
  AvailabilityStatusEnum? get status => _$this._status;
  set status(AvailabilityStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  AvailabilityBuilder() {
    Availability._defaults(this);
  }

  AvailabilityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _instructorUserId = $v.instructorUserId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _timezone = $v.timezone;
      _status = $v.status;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Availability other) {
    _$v = other as _$Availability;
  }

  @override
  void update(void Function(AvailabilityBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Availability build() => _build();

  _$Availability _build() {
    final _$result =
        _$v ??
        _$Availability._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Availability', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'Availability',
            'branchId',
          ),
          instructorUserId: BuiltValueNullFieldError.checkNotNull(
            instructorUserId,
            r'Availability',
            'instructorUserId',
          ),
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'Availability',
            'startAt',
          ),
          endAt: BuiltValueNullFieldError.checkNotNull(
            endAt,
            r'Availability',
            'endAt',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'Availability',
            'timezone',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'Availability',
            'status',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'Availability',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

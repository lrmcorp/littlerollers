// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_schedule_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PublicScheduleDetailStatusEnum
_$publicScheduleDetailStatusEnum_PUBLISHED =
    const PublicScheduleDetailStatusEnum._('PUBLISHED');
const PublicScheduleDetailStatusEnum
_$publicScheduleDetailStatusEnum_CONFIRMED =
    const PublicScheduleDetailStatusEnum._('CONFIRMED');

PublicScheduleDetailStatusEnum _$publicScheduleDetailStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PUBLISHED':
      return _$publicScheduleDetailStatusEnum_PUBLISHED;
    case 'CONFIRMED':
      return _$publicScheduleDetailStatusEnum_CONFIRMED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PublicScheduleDetailStatusEnum>
_$publicScheduleDetailStatusEnumValues =
    BuiltSet<PublicScheduleDetailStatusEnum>(
      const <PublicScheduleDetailStatusEnum>[
        _$publicScheduleDetailStatusEnum_PUBLISHED,
        _$publicScheduleDetailStatusEnum_CONFIRMED,
      ],
    );

Serializer<PublicScheduleDetailStatusEnum>
_$publicScheduleDetailStatusEnumSerializer =
    _$PublicScheduleDetailStatusEnumSerializer();

class _$PublicScheduleDetailStatusEnumSerializer
    implements PrimitiveSerializer<PublicScheduleDetailStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
  };

  @override
  final Iterable<Type> types = const <Type>[PublicScheduleDetailStatusEnum];
  @override
  final String wireName = 'PublicScheduleDetailStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PublicScheduleDetailStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PublicScheduleDetailStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PublicScheduleDetailStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PublicScheduleDetail extends PublicScheduleDetail {
  @override
  final PublicClassProfile classProfile;
  @override
  final String id;
  @override
  final String? branchId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;
  @override
  final String timezone;
  @override
  final PublicScheduleSummaryStatusEnum status;
  @override
  final int capacity;
  @override
  final int available;
  @override
  final PublicBranch? branch;
  @override
  final PublicClassTypeRef? classType;
  @override
  final PublicScheduleSummaryInstructor? instructor;

  factory _$PublicScheduleDetail([
    void Function(PublicScheduleDetailBuilder)? updates,
  ]) => (PublicScheduleDetailBuilder()..update(updates))._build();

  _$PublicScheduleDetail._({
    required this.classProfile,
    required this.id,
    this.branchId,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
    required this.capacity,
    required this.available,
    this.branch,
    this.classType,
    this.instructor,
  }) : super._();
  @override
  PublicScheduleDetail rebuild(
    void Function(PublicScheduleDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicScheduleDetailBuilder toBuilder() =>
      PublicScheduleDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicScheduleDetail &&
        classProfile == other.classProfile &&
        id == other.id &&
        branchId == other.branchId &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        timezone == other.timezone &&
        status == other.status &&
        capacity == other.capacity &&
        available == other.available &&
        branch == other.branch &&
        classType == other.classType &&
        instructor == other.instructor;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classProfile.hashCode);
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jc(_$hash, instructor.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicScheduleDetail')
          ..add('classProfile', classProfile)
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('timezone', timezone)
          ..add('status', status)
          ..add('capacity', capacity)
          ..add('available', available)
          ..add('branch', branch)
          ..add('classType', classType)
          ..add('instructor', instructor))
        .toString();
  }
}

class PublicScheduleDetailBuilder
    implements
        Builder<PublicScheduleDetail, PublicScheduleDetailBuilder>,
        PublicScheduleSummaryBuilder {
  _$PublicScheduleDetail? _$v;

  PublicClassProfile? _classProfile;
  PublicClassProfile? get classProfile => _$this._classProfile;
  set classProfile(covariant PublicClassProfile? classProfile) =>
      _$this._classProfile = classProfile;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(covariant DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(covariant DateTime? endAt) => _$this._endAt = endAt;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(covariant String? timezone) => _$this._timezone = timezone;

  PublicScheduleSummaryStatusEnum? _status;
  PublicScheduleSummaryStatusEnum? get status => _$this._status;
  set status(covariant PublicScheduleSummaryStatusEnum? status) =>
      _$this._status = status;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(covariant int? capacity) => _$this._capacity = capacity;

  int? _available;
  int? get available => _$this._available;
  set available(covariant int? available) => _$this._available = available;

  PublicBranch? _branch;
  PublicBranch? get branch => _$this._branch;
  set branch(covariant PublicBranch? branch) => _$this._branch = branch;

  PublicClassTypeRefBuilder? _classType;
  PublicClassTypeRefBuilder get classType =>
      _$this._classType ??= PublicClassTypeRefBuilder();
  set classType(covariant PublicClassTypeRefBuilder? classType) =>
      _$this._classType = classType;

  PublicScheduleSummaryInstructorBuilder? _instructor;
  PublicScheduleSummaryInstructorBuilder get instructor =>
      _$this._instructor ??= PublicScheduleSummaryInstructorBuilder();
  set instructor(
    covariant PublicScheduleSummaryInstructorBuilder? instructor,
  ) => _$this._instructor = instructor;

  PublicScheduleDetailBuilder() {
    PublicScheduleDetail._defaults(this);
  }

  PublicScheduleDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classProfile = $v.classProfile;
      _id = $v.id;
      _branchId = $v.branchId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _timezone = $v.timezone;
      _status = $v.status;
      _capacity = $v.capacity;
      _available = $v.available;
      _branch = $v.branch;
      _classType = $v.classType?.toBuilder();
      _instructor = $v.instructor?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant PublicScheduleDetail other) {
    _$v = other as _$PublicScheduleDetail;
  }

  @override
  void update(void Function(PublicScheduleDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicScheduleDetail build() => _build();

  _$PublicScheduleDetail _build() {
    _$PublicScheduleDetail _$result;
    try {
      _$result =
          _$v ??
          _$PublicScheduleDetail._(
            classProfile: BuiltValueNullFieldError.checkNotNull(
              classProfile,
              r'PublicScheduleDetail',
              'classProfile',
            ),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'PublicScheduleDetail',
              'id',
            ),
            branchId: branchId,
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'PublicScheduleDetail',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'PublicScheduleDetail',
              'endAt',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'PublicScheduleDetail',
              'timezone',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'PublicScheduleDetail',
              'status',
            ),
            capacity: BuiltValueNullFieldError.checkNotNull(
              capacity,
              r'PublicScheduleDetail',
              'capacity',
            ),
            available: BuiltValueNullFieldError.checkNotNull(
              available,
              r'PublicScheduleDetail',
              'available',
            ),
            branch: branch,
            classType: _classType?.build(),
            instructor: _instructor?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'classType';
        _classType?.build();
        _$failedField = 'instructor';
        _instructor?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicScheduleDetail',
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

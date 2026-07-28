// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_schedule_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PublicScheduleSummaryStatusEnum
_$publicScheduleSummaryStatusEnum_PUBLISHED =
    const PublicScheduleSummaryStatusEnum._('PUBLISHED');
const PublicScheduleSummaryStatusEnum
_$publicScheduleSummaryStatusEnum_CONFIRMED =
    const PublicScheduleSummaryStatusEnum._('CONFIRMED');

PublicScheduleSummaryStatusEnum _$publicScheduleSummaryStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PUBLISHED':
      return _$publicScheduleSummaryStatusEnum_PUBLISHED;
    case 'CONFIRMED':
      return _$publicScheduleSummaryStatusEnum_CONFIRMED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PublicScheduleSummaryStatusEnum>
_$publicScheduleSummaryStatusEnumValues =
    BuiltSet<PublicScheduleSummaryStatusEnum>(
      const <PublicScheduleSummaryStatusEnum>[
        _$publicScheduleSummaryStatusEnum_PUBLISHED,
        _$publicScheduleSummaryStatusEnum_CONFIRMED,
      ],
    );

Serializer<PublicScheduleSummaryStatusEnum>
_$publicScheduleSummaryStatusEnumSerializer =
    _$PublicScheduleSummaryStatusEnumSerializer();

class _$PublicScheduleSummaryStatusEnumSerializer
    implements PrimitiveSerializer<PublicScheduleSummaryStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
  };

  @override
  final Iterable<Type> types = const <Type>[PublicScheduleSummaryStatusEnum];
  @override
  final String wireName = 'PublicScheduleSummaryStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PublicScheduleSummaryStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PublicScheduleSummaryStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PublicScheduleSummaryStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

abstract mixin class PublicScheduleSummaryBuilder {
  void replace(PublicScheduleSummary other);
  void update(void Function(PublicScheduleSummaryBuilder) updates);
  String? get id;
  set id(String? id);

  String? get branchId;
  set branchId(String? branchId);

  DateTime? get startAt;
  set startAt(DateTime? startAt);

  DateTime? get endAt;
  set endAt(DateTime? endAt);

  String? get timezone;
  set timezone(String? timezone);

  PublicScheduleSummaryStatusEnum? get status;
  set status(PublicScheduleSummaryStatusEnum? status);

  int? get capacity;
  set capacity(int? capacity);

  int? get available;
  set available(int? available);

  PublicBranch? get branch;
  set branch(PublicBranch? branch);

  PublicClassTypeRefBuilder get classType;
  set classType(PublicClassTypeRefBuilder? classType);

  PublicScheduleSummaryInstructorBuilder get instructor;
  set instructor(PublicScheduleSummaryInstructorBuilder? instructor);
}

class _$$PublicScheduleSummary extends $PublicScheduleSummary {
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

  factory _$$PublicScheduleSummary([
    void Function($PublicScheduleSummaryBuilder)? updates,
  ]) => ($PublicScheduleSummaryBuilder()..update(updates))._build();

  _$$PublicScheduleSummary._({
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
  $PublicScheduleSummary rebuild(
    void Function($PublicScheduleSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  $PublicScheduleSummaryBuilder toBuilder() =>
      $PublicScheduleSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $PublicScheduleSummary &&
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
    return (newBuiltValueToStringHelper(r'$PublicScheduleSummary')
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

class $PublicScheduleSummaryBuilder
    implements
        Builder<$PublicScheduleSummary, $PublicScheduleSummaryBuilder>,
        PublicScheduleSummaryBuilder {
  _$$PublicScheduleSummary? _$v;

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

  $PublicScheduleSummaryBuilder() {
    $PublicScheduleSummary._defaults(this);
  }

  $PublicScheduleSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
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
  void replace(covariant $PublicScheduleSummary other) {
    _$v = other as _$$PublicScheduleSummary;
  }

  @override
  void update(void Function($PublicScheduleSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $PublicScheduleSummary build() => _build();

  _$$PublicScheduleSummary _build() {
    _$$PublicScheduleSummary _$result;
    try {
      _$result =
          _$v ??
          _$$PublicScheduleSummary._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'$PublicScheduleSummary',
              'id',
            ),
            branchId: branchId,
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'$PublicScheduleSummary',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'$PublicScheduleSummary',
              'endAt',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'$PublicScheduleSummary',
              'timezone',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'$PublicScheduleSummary',
              'status',
            ),
            capacity: BuiltValueNullFieldError.checkNotNull(
              capacity,
              r'$PublicScheduleSummary',
              'capacity',
            ),
            available: BuiltValueNullFieldError.checkNotNull(
              available,
              r'$PublicScheduleSummary',
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
          r'$PublicScheduleSummary',
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

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quota_evaluation_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const QuotaEvaluationResultStatusEnum
_$quotaEvaluationResultStatusEnum_CONFIRMED =
    const QuotaEvaluationResultStatusEnum._('CONFIRMED');
const QuotaEvaluationResultStatusEnum
_$quotaEvaluationResultStatusEnum_AUTO_CANCELLED =
    const QuotaEvaluationResultStatusEnum._('AUTO_CANCELLED');

QuotaEvaluationResultStatusEnum _$quotaEvaluationResultStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'CONFIRMED':
      return _$quotaEvaluationResultStatusEnum_CONFIRMED;
    case 'AUTO_CANCELLED':
      return _$quotaEvaluationResultStatusEnum_AUTO_CANCELLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<QuotaEvaluationResultStatusEnum>
_$quotaEvaluationResultStatusEnumValues =
    BuiltSet<QuotaEvaluationResultStatusEnum>(
      const <QuotaEvaluationResultStatusEnum>[
        _$quotaEvaluationResultStatusEnum_CONFIRMED,
        _$quotaEvaluationResultStatusEnum_AUTO_CANCELLED,
      ],
    );

Serializer<QuotaEvaluationResultStatusEnum>
_$quotaEvaluationResultStatusEnumSerializer =
    _$QuotaEvaluationResultStatusEnumSerializer();

class _$QuotaEvaluationResultStatusEnumSerializer
    implements PrimitiveSerializer<QuotaEvaluationResultStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CONFIRMED': 'CONFIRMED',
    'AUTO_CANCELLED': 'AUTO_CANCELLED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CONFIRMED': 'CONFIRMED',
    'AUTO_CANCELLED': 'AUTO_CANCELLED',
  };

  @override
  final Iterable<Type> types = const <Type>[QuotaEvaluationResultStatusEnum];
  @override
  final String wireName = 'QuotaEvaluationResultStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    QuotaEvaluationResultStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  QuotaEvaluationResultStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => QuotaEvaluationResultStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$QuotaEvaluationResult extends QuotaEvaluationResult {
  @override
  final String classSlotId;
  @override
  final String previousStatus;
  @override
  final QuotaEvaluationResultStatusEnum status;
  @override
  final int bookingCount;
  @override
  final int minimumQuota;
  @override
  final BuiltList<String>? releasedReservationIds;
  @override
  final BuiltList<String>? outboxEventIds;
  @override
  final DateTime evaluatedAt;
  @override
  final bool idempotentReplay;

  factory _$QuotaEvaluationResult([
    void Function(QuotaEvaluationResultBuilder)? updates,
  ]) => (QuotaEvaluationResultBuilder()..update(updates))._build();

  _$QuotaEvaluationResult._({
    required this.classSlotId,
    required this.previousStatus,
    required this.status,
    required this.bookingCount,
    required this.minimumQuota,
    this.releasedReservationIds,
    this.outboxEventIds,
    required this.evaluatedAt,
    required this.idempotentReplay,
  }) : super._();
  @override
  QuotaEvaluationResult rebuild(
    void Function(QuotaEvaluationResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  QuotaEvaluationResultBuilder toBuilder() =>
      QuotaEvaluationResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuotaEvaluationResult &&
        classSlotId == other.classSlotId &&
        previousStatus == other.previousStatus &&
        status == other.status &&
        bookingCount == other.bookingCount &&
        minimumQuota == other.minimumQuota &&
        releasedReservationIds == other.releasedReservationIds &&
        outboxEventIds == other.outboxEventIds &&
        evaluatedAt == other.evaluatedAt &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classSlotId.hashCode);
    _$hash = $jc(_$hash, previousStatus.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, bookingCount.hashCode);
    _$hash = $jc(_$hash, minimumQuota.hashCode);
    _$hash = $jc(_$hash, releasedReservationIds.hashCode);
    _$hash = $jc(_$hash, outboxEventIds.hashCode);
    _$hash = $jc(_$hash, evaluatedAt.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuotaEvaluationResult')
          ..add('classSlotId', classSlotId)
          ..add('previousStatus', previousStatus)
          ..add('status', status)
          ..add('bookingCount', bookingCount)
          ..add('minimumQuota', minimumQuota)
          ..add('releasedReservationIds', releasedReservationIds)
          ..add('outboxEventIds', outboxEventIds)
          ..add('evaluatedAt', evaluatedAt)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class QuotaEvaluationResultBuilder
    implements Builder<QuotaEvaluationResult, QuotaEvaluationResultBuilder> {
  _$QuotaEvaluationResult? _$v;

  String? _classSlotId;
  String? get classSlotId => _$this._classSlotId;
  set classSlotId(String? classSlotId) => _$this._classSlotId = classSlotId;

  String? _previousStatus;
  String? get previousStatus => _$this._previousStatus;
  set previousStatus(String? previousStatus) =>
      _$this._previousStatus = previousStatus;

  QuotaEvaluationResultStatusEnum? _status;
  QuotaEvaluationResultStatusEnum? get status => _$this._status;
  set status(QuotaEvaluationResultStatusEnum? status) =>
      _$this._status = status;

  int? _bookingCount;
  int? get bookingCount => _$this._bookingCount;
  set bookingCount(int? bookingCount) => _$this._bookingCount = bookingCount;

  int? _minimumQuota;
  int? get minimumQuota => _$this._minimumQuota;
  set minimumQuota(int? minimumQuota) => _$this._minimumQuota = minimumQuota;

  ListBuilder<String>? _releasedReservationIds;
  ListBuilder<String> get releasedReservationIds =>
      _$this._releasedReservationIds ??= ListBuilder<String>();
  set releasedReservationIds(ListBuilder<String>? releasedReservationIds) =>
      _$this._releasedReservationIds = releasedReservationIds;

  ListBuilder<String>? _outboxEventIds;
  ListBuilder<String> get outboxEventIds =>
      _$this._outboxEventIds ??= ListBuilder<String>();
  set outboxEventIds(ListBuilder<String>? outboxEventIds) =>
      _$this._outboxEventIds = outboxEventIds;

  DateTime? _evaluatedAt;
  DateTime? get evaluatedAt => _$this._evaluatedAt;
  set evaluatedAt(DateTime? evaluatedAt) => _$this._evaluatedAt = evaluatedAt;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  QuotaEvaluationResultBuilder() {
    QuotaEvaluationResult._defaults(this);
  }

  QuotaEvaluationResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classSlotId = $v.classSlotId;
      _previousStatus = $v.previousStatus;
      _status = $v.status;
      _bookingCount = $v.bookingCount;
      _minimumQuota = $v.minimumQuota;
      _releasedReservationIds = $v.releasedReservationIds?.toBuilder();
      _outboxEventIds = $v.outboxEventIds?.toBuilder();
      _evaluatedAt = $v.evaluatedAt;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuotaEvaluationResult other) {
    _$v = other as _$QuotaEvaluationResult;
  }

  @override
  void update(void Function(QuotaEvaluationResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuotaEvaluationResult build() => _build();

  _$QuotaEvaluationResult _build() {
    _$QuotaEvaluationResult _$result;
    try {
      _$result =
          _$v ??
          _$QuotaEvaluationResult._(
            classSlotId: BuiltValueNullFieldError.checkNotNull(
              classSlotId,
              r'QuotaEvaluationResult',
              'classSlotId',
            ),
            previousStatus: BuiltValueNullFieldError.checkNotNull(
              previousStatus,
              r'QuotaEvaluationResult',
              'previousStatus',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'QuotaEvaluationResult',
              'status',
            ),
            bookingCount: BuiltValueNullFieldError.checkNotNull(
              bookingCount,
              r'QuotaEvaluationResult',
              'bookingCount',
            ),
            minimumQuota: BuiltValueNullFieldError.checkNotNull(
              minimumQuota,
              r'QuotaEvaluationResult',
              'minimumQuota',
            ),
            releasedReservationIds: _releasedReservationIds?.build(),
            outboxEventIds: _outboxEventIds?.build(),
            evaluatedAt: BuiltValueNullFieldError.checkNotNull(
              evaluatedAt,
              r'QuotaEvaluationResult',
              'evaluatedAt',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'QuotaEvaluationResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'releasedReservationIds';
        _releasedReservationIds?.build();
        _$failedField = 'outboxEventIds';
        _outboxEventIds?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'QuotaEvaluationResult',
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

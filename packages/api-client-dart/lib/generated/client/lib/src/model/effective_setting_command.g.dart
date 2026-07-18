// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'effective_setting_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EffectiveSettingCommand extends EffectiveSettingCommand {
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final String? instructorUserId;
  @override
  final int value;
  @override
  final int? capacity;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;
  @override
  final String reason;

  factory _$EffectiveSettingCommand([
    void Function(EffectiveSettingCommandBuilder)? updates,
  ]) => (EffectiveSettingCommandBuilder()..update(updates))._build();

  _$EffectiveSettingCommand._({
    required this.branchId,
    required this.classTypeId,
    this.instructorUserId,
    required this.value,
    this.capacity,
    required this.effectiveFrom,
    this.effectiveUntil,
    required this.reason,
  }) : super._();
  @override
  EffectiveSettingCommand rebuild(
    void Function(EffectiveSettingCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  EffectiveSettingCommandBuilder toBuilder() =>
      EffectiveSettingCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EffectiveSettingCommand &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        instructorUserId == other.instructorUserId &&
        value == other.value &&
        capacity == other.capacity &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, value.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EffectiveSettingCommand')
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('instructorUserId', instructorUserId)
          ..add('value', value)
          ..add('capacity', capacity)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil)
          ..add('reason', reason))
        .toString();
  }
}

class EffectiveSettingCommandBuilder
    implements
        Builder<EffectiveSettingCommand, EffectiveSettingCommandBuilder> {
  _$EffectiveSettingCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

  int? _value;
  int? get value => _$this._value;
  set value(int? value) => _$this._value = value;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  EffectiveSettingCommandBuilder() {
    EffectiveSettingCommand._defaults(this);
  }

  EffectiveSettingCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _instructorUserId = $v.instructorUserId;
      _value = $v.value;
      _capacity = $v.capacity;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EffectiveSettingCommand other) {
    _$v = other as _$EffectiveSettingCommand;
  }

  @override
  void update(void Function(EffectiveSettingCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EffectiveSettingCommand build() => _build();

  _$EffectiveSettingCommand _build() {
    final _$result =
        _$v ??
        _$EffectiveSettingCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'EffectiveSettingCommand',
            'branchId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'EffectiveSettingCommand',
            'classTypeId',
          ),
          instructorUserId: instructorUserId,
          value: BuiltValueNullFieldError.checkNotNull(
            value,
            r'EffectiveSettingCommand',
            'value',
          ),
          capacity: capacity,
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'EffectiveSettingCommand',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'EffectiveSettingCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_slot_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassSlotCommand extends ClassSlotCommand {
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final String? instructorUserId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;

  factory _$ClassSlotCommand([
    void Function(ClassSlotCommandBuilder)? updates,
  ]) => (ClassSlotCommandBuilder()..update(updates))._build();

  _$ClassSlotCommand._({
    required this.branchId,
    required this.classTypeId,
    this.instructorUserId,
    required this.startAt,
    required this.endAt,
  }) : super._();
  @override
  ClassSlotCommand rebuild(void Function(ClassSlotCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassSlotCommandBuilder toBuilder() =>
      ClassSlotCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassSlotCommand &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        instructorUserId == other.instructorUserId &&
        startAt == other.startAt &&
        endAt == other.endAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassSlotCommand')
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('instructorUserId', instructorUserId)
          ..add('startAt', startAt)
          ..add('endAt', endAt))
        .toString();
  }
}

class ClassSlotCommandBuilder
    implements Builder<ClassSlotCommand, ClassSlotCommandBuilder> {
  _$ClassSlotCommand? _$v;

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

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  ClassSlotCommandBuilder() {
    ClassSlotCommand._defaults(this);
  }

  ClassSlotCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _instructorUserId = $v.instructorUserId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassSlotCommand other) {
    _$v = other as _$ClassSlotCommand;
  }

  @override
  void update(void Function(ClassSlotCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassSlotCommand build() => _build();

  _$ClassSlotCommand _build() {
    final _$result =
        _$v ??
        _$ClassSlotCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'ClassSlotCommand',
            'branchId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'ClassSlotCommand',
            'classTypeId',
          ),
          instructorUserId: instructorUserId,
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'ClassSlotCommand',
            'startAt',
          ),
          endAt: BuiltValueNullFieldError.checkNotNull(
            endAt,
            r'ClassSlotCommand',
            'endAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

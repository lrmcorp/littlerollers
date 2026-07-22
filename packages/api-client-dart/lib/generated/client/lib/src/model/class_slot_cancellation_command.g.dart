// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_slot_cancellation_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ClassSlotCancellationCommandReasonCodeEnum
_$classSlotCancellationCommandReasonCodeEnum_STUDIO_UNAVAILABLE =
    const ClassSlotCancellationCommandReasonCodeEnum._('STUDIO_UNAVAILABLE');
const ClassSlotCancellationCommandReasonCodeEnum
_$classSlotCancellationCommandReasonCodeEnum_INSTRUCTOR_UNAVAILABLE =
    const ClassSlotCancellationCommandReasonCodeEnum._(
      'INSTRUCTOR_UNAVAILABLE',
    );
const ClassSlotCancellationCommandReasonCodeEnum
_$classSlotCancellationCommandReasonCodeEnum_SAFETY_ISSUE =
    const ClassSlotCancellationCommandReasonCodeEnum._('SAFETY_ISSUE');
const ClassSlotCancellationCommandReasonCodeEnum
_$classSlotCancellationCommandReasonCodeEnum_OTHER_REVIEW_REQUIRED =
    const ClassSlotCancellationCommandReasonCodeEnum._('OTHER_REVIEW_REQUIRED');

ClassSlotCancellationCommandReasonCodeEnum
_$classSlotCancellationCommandReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'STUDIO_UNAVAILABLE':
      return _$classSlotCancellationCommandReasonCodeEnum_STUDIO_UNAVAILABLE;
    case 'INSTRUCTOR_UNAVAILABLE':
      return _$classSlotCancellationCommandReasonCodeEnum_INSTRUCTOR_UNAVAILABLE;
    case 'SAFETY_ISSUE':
      return _$classSlotCancellationCommandReasonCodeEnum_SAFETY_ISSUE;
    case 'OTHER_REVIEW_REQUIRED':
      return _$classSlotCancellationCommandReasonCodeEnum_OTHER_REVIEW_REQUIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ClassSlotCancellationCommandReasonCodeEnum>
_$classSlotCancellationCommandReasonCodeEnumValues =
    BuiltSet<ClassSlotCancellationCommandReasonCodeEnum>(
      const <ClassSlotCancellationCommandReasonCodeEnum>[
        _$classSlotCancellationCommandReasonCodeEnum_STUDIO_UNAVAILABLE,
        _$classSlotCancellationCommandReasonCodeEnum_INSTRUCTOR_UNAVAILABLE,
        _$classSlotCancellationCommandReasonCodeEnum_SAFETY_ISSUE,
        _$classSlotCancellationCommandReasonCodeEnum_OTHER_REVIEW_REQUIRED,
      ],
    );

Serializer<ClassSlotCancellationCommandReasonCodeEnum>
_$classSlotCancellationCommandReasonCodeEnumSerializer =
    _$ClassSlotCancellationCommandReasonCodeEnumSerializer();

class _$ClassSlotCancellationCommandReasonCodeEnumSerializer
    implements PrimitiveSerializer<ClassSlotCancellationCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'STUDIO_UNAVAILABLE': 'STUDIO_UNAVAILABLE',
    'INSTRUCTOR_UNAVAILABLE': 'INSTRUCTOR_UNAVAILABLE',
    'SAFETY_ISSUE': 'SAFETY_ISSUE',
    'OTHER_REVIEW_REQUIRED': 'OTHER_REVIEW_REQUIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'STUDIO_UNAVAILABLE': 'STUDIO_UNAVAILABLE',
    'INSTRUCTOR_UNAVAILABLE': 'INSTRUCTOR_UNAVAILABLE',
    'SAFETY_ISSUE': 'SAFETY_ISSUE',
    'OTHER_REVIEW_REQUIRED': 'OTHER_REVIEW_REQUIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    ClassSlotCancellationCommandReasonCodeEnum,
  ];
  @override
  final String wireName = 'ClassSlotCancellationCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    ClassSlotCancellationCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  ClassSlotCancellationCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => ClassSlotCancellationCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$ClassSlotCancellationCommand extends ClassSlotCancellationCommand {
  @override
  final ClassSlotCancellationCommandReasonCodeEnum reasonCode;
  @override
  final int expectedVersion;

  factory _$ClassSlotCancellationCommand([
    void Function(ClassSlotCancellationCommandBuilder)? updates,
  ]) => (ClassSlotCancellationCommandBuilder()..update(updates))._build();

  _$ClassSlotCancellationCommand._({
    required this.reasonCode,
    required this.expectedVersion,
  }) : super._();
  @override
  ClassSlotCancellationCommand rebuild(
    void Function(ClassSlotCancellationCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ClassSlotCancellationCommandBuilder toBuilder() =>
      ClassSlotCancellationCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassSlotCancellationCommand &&
        reasonCode == other.reasonCode &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassSlotCancellationCommand')
          ..add('reasonCode', reasonCode)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class ClassSlotCancellationCommandBuilder
    implements
        Builder<
          ClassSlotCancellationCommand,
          ClassSlotCancellationCommandBuilder
        > {
  _$ClassSlotCancellationCommand? _$v;

  ClassSlotCancellationCommandReasonCodeEnum? _reasonCode;
  ClassSlotCancellationCommandReasonCodeEnum? get reasonCode =>
      _$this._reasonCode;
  set reasonCode(ClassSlotCancellationCommandReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  ClassSlotCancellationCommandBuilder() {
    ClassSlotCancellationCommand._defaults(this);
  }

  ClassSlotCancellationCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reasonCode = $v.reasonCode;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassSlotCancellationCommand other) {
    _$v = other as _$ClassSlotCancellationCommand;
  }

  @override
  void update(void Function(ClassSlotCancellationCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassSlotCancellationCommand build() => _build();

  _$ClassSlotCancellationCommand _build() {
    final _$result =
        _$v ??
        _$ClassSlotCancellationCommand._(
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'ClassSlotCancellationCommand',
            'reasonCode',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ClassSlotCancellationCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

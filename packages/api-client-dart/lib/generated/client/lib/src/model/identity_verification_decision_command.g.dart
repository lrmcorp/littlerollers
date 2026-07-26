// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_decision_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_BLURRY =
    const IdentityVerificationDecisionCommandReasonCodeEnum._('BLURRY');
const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_GLARE =
    const IdentityVerificationDecisionCommandReasonCodeEnum._('GLARE');
const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_CROPPED =
    const IdentityVerificationDecisionCommandReasonCodeEnum._('CROPPED');
const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_DOCUMENT_UNREADABLE =
    const IdentityVerificationDecisionCommandReasonCodeEnum._(
      'DOCUMENT_UNREADABLE',
    );
const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_FACE_MISMATCH =
    const IdentityVerificationDecisionCommandReasonCodeEnum._('FACE_MISMATCH');
const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_WRONG_DOCUMENT =
    const IdentityVerificationDecisionCommandReasonCodeEnum._('WRONG_DOCUMENT');
const IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnum_OTHER_REQUIRES_NOTE =
    const IdentityVerificationDecisionCommandReasonCodeEnum._(
      'OTHER_REQUIRES_NOTE',
    );

IdentityVerificationDecisionCommandReasonCodeEnum
_$identityVerificationDecisionCommandReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'BLURRY':
      return _$identityVerificationDecisionCommandReasonCodeEnum_BLURRY;
    case 'GLARE':
      return _$identityVerificationDecisionCommandReasonCodeEnum_GLARE;
    case 'CROPPED':
      return _$identityVerificationDecisionCommandReasonCodeEnum_CROPPED;
    case 'DOCUMENT_UNREADABLE':
      return _$identityVerificationDecisionCommandReasonCodeEnum_DOCUMENT_UNREADABLE;
    case 'FACE_MISMATCH':
      return _$identityVerificationDecisionCommandReasonCodeEnum_FACE_MISMATCH;
    case 'WRONG_DOCUMENT':
      return _$identityVerificationDecisionCommandReasonCodeEnum_WRONG_DOCUMENT;
    case 'OTHER_REQUIRES_NOTE':
      return _$identityVerificationDecisionCommandReasonCodeEnum_OTHER_REQUIRES_NOTE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationDecisionCommandReasonCodeEnum>
_$identityVerificationDecisionCommandReasonCodeEnumValues =
    BuiltSet<IdentityVerificationDecisionCommandReasonCodeEnum>(
      const <IdentityVerificationDecisionCommandReasonCodeEnum>[
        _$identityVerificationDecisionCommandReasonCodeEnum_BLURRY,
        _$identityVerificationDecisionCommandReasonCodeEnum_GLARE,
        _$identityVerificationDecisionCommandReasonCodeEnum_CROPPED,
        _$identityVerificationDecisionCommandReasonCodeEnum_DOCUMENT_UNREADABLE,
        _$identityVerificationDecisionCommandReasonCodeEnum_FACE_MISMATCH,
        _$identityVerificationDecisionCommandReasonCodeEnum_WRONG_DOCUMENT,
        _$identityVerificationDecisionCommandReasonCodeEnum_OTHER_REQUIRES_NOTE,
      ],
    );

Serializer<IdentityVerificationDecisionCommandReasonCodeEnum>
_$identityVerificationDecisionCommandReasonCodeEnumSerializer =
    _$IdentityVerificationDecisionCommandReasonCodeEnumSerializer();

class _$IdentityVerificationDecisionCommandReasonCodeEnumSerializer
    implements
        PrimitiveSerializer<IdentityVerificationDecisionCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BLURRY': 'BLURRY',
    'GLARE': 'GLARE',
    'CROPPED': 'CROPPED',
    'DOCUMENT_UNREADABLE': 'DOCUMENT_UNREADABLE',
    'FACE_MISMATCH': 'FACE_MISMATCH',
    'WRONG_DOCUMENT': 'WRONG_DOCUMENT',
    'OTHER_REQUIRES_NOTE': 'OTHER_REQUIRES_NOTE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BLURRY': 'BLURRY',
    'GLARE': 'GLARE',
    'CROPPED': 'CROPPED',
    'DOCUMENT_UNREADABLE': 'DOCUMENT_UNREADABLE',
    'FACE_MISMATCH': 'FACE_MISMATCH',
    'WRONG_DOCUMENT': 'WRONG_DOCUMENT',
    'OTHER_REQUIRES_NOTE': 'OTHER_REQUIRES_NOTE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    IdentityVerificationDecisionCommandReasonCodeEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationDecisionCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDecisionCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationDecisionCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationDecisionCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationDecisionCommand
    extends IdentityVerificationDecisionCommand {
  @override
  final int expectedVersion;
  @override
  final IdentityVerificationDecisionCommandReasonCodeEnum? reasonCode;
  @override
  final String? note;

  factory _$IdentityVerificationDecisionCommand([
    void Function(IdentityVerificationDecisionCommandBuilder)? updates,
  ]) =>
      (IdentityVerificationDecisionCommandBuilder()..update(updates))._build();

  _$IdentityVerificationDecisionCommand._({
    required this.expectedVersion,
    this.reasonCode,
    this.note,
  }) : super._();
  @override
  IdentityVerificationDecisionCommand rebuild(
    void Function(IdentityVerificationDecisionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationDecisionCommandBuilder toBuilder() =>
      IdentityVerificationDecisionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationDecisionCommand &&
        expectedVersion == other.expectedVersion &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationDecisionCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class IdentityVerificationDecisionCommandBuilder
    implements
        Builder<
          IdentityVerificationDecisionCommand,
          IdentityVerificationDecisionCommandBuilder
        > {
  _$IdentityVerificationDecisionCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  IdentityVerificationDecisionCommandReasonCodeEnum? _reasonCode;
  IdentityVerificationDecisionCommandReasonCodeEnum? get reasonCode =>
      _$this._reasonCode;
  set reasonCode(
    IdentityVerificationDecisionCommandReasonCodeEnum? reasonCode,
  ) => _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  IdentityVerificationDecisionCommandBuilder() {
    IdentityVerificationDecisionCommand._defaults(this);
  }

  IdentityVerificationDecisionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationDecisionCommand other) {
    _$v = other as _$IdentityVerificationDecisionCommand;
  }

  @override
  void update(
    void Function(IdentityVerificationDecisionCommandBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationDecisionCommand build() => _build();

  _$IdentityVerificationDecisionCommand _build() {
    final _$result =
        _$v ??
        _$IdentityVerificationDecisionCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'IdentityVerificationDecisionCommand',
            'expectedVersion',
          ),
          reasonCode: reasonCode,
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_adjustment_decision_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const SessionAdjustmentDecisionCommandReasonCodeEnum
_$sessionAdjustmentDecisionCommandReasonCodeEnum_CORRECTION_VERIFIED =
    const SessionAdjustmentDecisionCommandReasonCodeEnum._(
      'CORRECTION_VERIFIED',
    );
const SessionAdjustmentDecisionCommandReasonCodeEnum
_$sessionAdjustmentDecisionCommandReasonCodeEnum_INVALID_EVIDENCE =
    const SessionAdjustmentDecisionCommandReasonCodeEnum._('INVALID_EVIDENCE');
const SessionAdjustmentDecisionCommandReasonCodeEnum
_$sessionAdjustmentDecisionCommandReasonCodeEnum_DUPLICATE_REQUEST =
    const SessionAdjustmentDecisionCommandReasonCodeEnum._('DUPLICATE_REQUEST');
const SessionAdjustmentDecisionCommandReasonCodeEnum
_$sessionAdjustmentDecisionCommandReasonCodeEnum_OUT_OF_SCOPE =
    const SessionAdjustmentDecisionCommandReasonCodeEnum._('OUT_OF_SCOPE');

SessionAdjustmentDecisionCommandReasonCodeEnum
_$sessionAdjustmentDecisionCommandReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'CORRECTION_VERIFIED':
      return _$sessionAdjustmentDecisionCommandReasonCodeEnum_CORRECTION_VERIFIED;
    case 'INVALID_EVIDENCE':
      return _$sessionAdjustmentDecisionCommandReasonCodeEnum_INVALID_EVIDENCE;
    case 'DUPLICATE_REQUEST':
      return _$sessionAdjustmentDecisionCommandReasonCodeEnum_DUPLICATE_REQUEST;
    case 'OUT_OF_SCOPE':
      return _$sessionAdjustmentDecisionCommandReasonCodeEnum_OUT_OF_SCOPE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionAdjustmentDecisionCommandReasonCodeEnum>
_$sessionAdjustmentDecisionCommandReasonCodeEnumValues =
    BuiltSet<SessionAdjustmentDecisionCommandReasonCodeEnum>(
      const <SessionAdjustmentDecisionCommandReasonCodeEnum>[
        _$sessionAdjustmentDecisionCommandReasonCodeEnum_CORRECTION_VERIFIED,
        _$sessionAdjustmentDecisionCommandReasonCodeEnum_INVALID_EVIDENCE,
        _$sessionAdjustmentDecisionCommandReasonCodeEnum_DUPLICATE_REQUEST,
        _$sessionAdjustmentDecisionCommandReasonCodeEnum_OUT_OF_SCOPE,
      ],
    );

Serializer<SessionAdjustmentDecisionCommandReasonCodeEnum>
_$sessionAdjustmentDecisionCommandReasonCodeEnumSerializer =
    _$SessionAdjustmentDecisionCommandReasonCodeEnumSerializer();

class _$SessionAdjustmentDecisionCommandReasonCodeEnumSerializer
    implements
        PrimitiveSerializer<SessionAdjustmentDecisionCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CORRECTION_VERIFIED': 'CORRECTION_VERIFIED',
    'INVALID_EVIDENCE': 'INVALID_EVIDENCE',
    'DUPLICATE_REQUEST': 'DUPLICATE_REQUEST',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CORRECTION_VERIFIED': 'CORRECTION_VERIFIED',
    'INVALID_EVIDENCE': 'INVALID_EVIDENCE',
    'DUPLICATE_REQUEST': 'DUPLICATE_REQUEST',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    SessionAdjustmentDecisionCommandReasonCodeEnum,
  ];
  @override
  final String wireName = 'SessionAdjustmentDecisionCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentDecisionCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionAdjustmentDecisionCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionAdjustmentDecisionCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$SessionAdjustmentDecisionCommand
    extends SessionAdjustmentDecisionCommand {
  @override
  final SessionAdjustmentDecisionCommandReasonCodeEnum reasonCode;
  @override
  final String? note;
  @override
  final int expectedVersion;

  factory _$SessionAdjustmentDecisionCommand([
    void Function(SessionAdjustmentDecisionCommandBuilder)? updates,
  ]) => (SessionAdjustmentDecisionCommandBuilder()..update(updates))._build();

  _$SessionAdjustmentDecisionCommand._({
    required this.reasonCode,
    this.note,
    required this.expectedVersion,
  }) : super._();
  @override
  SessionAdjustmentDecisionCommand rebuild(
    void Function(SessionAdjustmentDecisionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  SessionAdjustmentDecisionCommandBuilder toBuilder() =>
      SessionAdjustmentDecisionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionAdjustmentDecisionCommand &&
        reasonCode == other.reasonCode &&
        note == other.note &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SessionAdjustmentDecisionCommand')
          ..add('reasonCode', reasonCode)
          ..add('note', note)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class SessionAdjustmentDecisionCommandBuilder
    implements
        Builder<
          SessionAdjustmentDecisionCommand,
          SessionAdjustmentDecisionCommandBuilder
        > {
  _$SessionAdjustmentDecisionCommand? _$v;

  SessionAdjustmentDecisionCommandReasonCodeEnum? _reasonCode;
  SessionAdjustmentDecisionCommandReasonCodeEnum? get reasonCode =>
      _$this._reasonCode;
  set reasonCode(SessionAdjustmentDecisionCommandReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  SessionAdjustmentDecisionCommandBuilder() {
    SessionAdjustmentDecisionCommand._defaults(this);
  }

  SessionAdjustmentDecisionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionAdjustmentDecisionCommand other) {
    _$v = other as _$SessionAdjustmentDecisionCommand;
  }

  @override
  void update(void Function(SessionAdjustmentDecisionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionAdjustmentDecisionCommand build() => _build();

  _$SessionAdjustmentDecisionCommand _build() {
    final _$result =
        _$v ??
        _$SessionAdjustmentDecisionCommand._(
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'SessionAdjustmentDecisionCommand',
            'reasonCode',
          ),
          note: note,
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'SessionAdjustmentDecisionCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

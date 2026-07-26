//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_decision_command.g.dart';

/// IdentityVerificationDecisionCommand
///
/// Properties:
/// * [expectedVersion] 
/// * [reasonCode] 
/// * [note] 
@BuiltValue()
abstract class IdentityVerificationDecisionCommand implements Built<IdentityVerificationDecisionCommand, IdentityVerificationDecisionCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reasonCode')
  IdentityVerificationDecisionCommandReasonCodeEnum? get reasonCode;
  // enum reasonCodeEnum {  BLURRY,  GLARE,  CROPPED,  DOCUMENT_UNREADABLE,  FACE_MISMATCH,  WRONG_DOCUMENT,  OTHER_REQUIRES_NOTE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  IdentityVerificationDecisionCommand._();

  factory IdentityVerificationDecisionCommand([void updates(IdentityVerificationDecisionCommandBuilder b)]) = _$IdentityVerificationDecisionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationDecisionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationDecisionCommand> get serializer => _$IdentityVerificationDecisionCommandSerializer();
}

class _$IdentityVerificationDecisionCommandSerializer implements PrimitiveSerializer<IdentityVerificationDecisionCommand> {
  @override
  final Iterable<Type> types = const [IdentityVerificationDecisionCommand, _$IdentityVerificationDecisionCommand];

  @override
  final String wireName = r'IdentityVerificationDecisionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationDecisionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    if (object.reasonCode != null) {
      yield r'reasonCode';
      yield serializers.serialize(
        object.reasonCode,
        specifiedType: const FullType(IdentityVerificationDecisionCommandReasonCodeEnum),
      );
    }
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDecisionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationDecisionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationDecisionCommandReasonCodeEnum),
          ) as IdentityVerificationDecisionCommandReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationDecisionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationDecisionCommandBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class IdentityVerificationDecisionCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BLURRY')
  static const IdentityVerificationDecisionCommandReasonCodeEnum BLURRY = _$identityVerificationDecisionCommandReasonCodeEnum_BLURRY;
  @BuiltValueEnumConst(wireName: r'GLARE')
  static const IdentityVerificationDecisionCommandReasonCodeEnum GLARE = _$identityVerificationDecisionCommandReasonCodeEnum_GLARE;
  @BuiltValueEnumConst(wireName: r'CROPPED')
  static const IdentityVerificationDecisionCommandReasonCodeEnum CROPPED = _$identityVerificationDecisionCommandReasonCodeEnum_CROPPED;
  @BuiltValueEnumConst(wireName: r'DOCUMENT_UNREADABLE')
  static const IdentityVerificationDecisionCommandReasonCodeEnum DOCUMENT_UNREADABLE = _$identityVerificationDecisionCommandReasonCodeEnum_DOCUMENT_UNREADABLE;
  @BuiltValueEnumConst(wireName: r'FACE_MISMATCH')
  static const IdentityVerificationDecisionCommandReasonCodeEnum FACE_MISMATCH = _$identityVerificationDecisionCommandReasonCodeEnum_FACE_MISMATCH;
  @BuiltValueEnumConst(wireName: r'WRONG_DOCUMENT')
  static const IdentityVerificationDecisionCommandReasonCodeEnum WRONG_DOCUMENT = _$identityVerificationDecisionCommandReasonCodeEnum_WRONG_DOCUMENT;
  @BuiltValueEnumConst(wireName: r'OTHER_REQUIRES_NOTE')
  static const IdentityVerificationDecisionCommandReasonCodeEnum OTHER_REQUIRES_NOTE = _$identityVerificationDecisionCommandReasonCodeEnum_OTHER_REQUIRES_NOTE;

  static Serializer<IdentityVerificationDecisionCommandReasonCodeEnum> get serializer => _$identityVerificationDecisionCommandReasonCodeEnumSerializer;

  const IdentityVerificationDecisionCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationDecisionCommandReasonCodeEnum> get values => _$identityVerificationDecisionCommandReasonCodeEnumValues;
  static IdentityVerificationDecisionCommandReasonCodeEnum valueOf(String name) => _$identityVerificationDecisionCommandReasonCodeEnumValueOf(name);
}


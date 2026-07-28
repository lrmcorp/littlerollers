//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_deletion_result.g.dart';

/// IdentityVerificationDeletionResult
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [version] 
/// * [auditReference] 
/// * [nextAttemptAt] 
@BuiltValue()
abstract class IdentityVerificationDeletionResult implements Built<IdentityVerificationDeletionResult, IdentityVerificationDeletionResultBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  IdentityVerificationDeletionResultStatusEnum get status;
  // enum statusEnum {  DELETED,  DELETE_FAILED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'auditReference')
  String get auditReference;

  @BuiltValueField(wireName: r'nextAttemptAt')
  DateTime? get nextAttemptAt;

  IdentityVerificationDeletionResult._();

  factory IdentityVerificationDeletionResult([void updates(IdentityVerificationDeletionResultBuilder b)]) = _$IdentityVerificationDeletionResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationDeletionResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationDeletionResult> get serializer => _$IdentityVerificationDeletionResultSerializer();
}

class _$IdentityVerificationDeletionResultSerializer implements PrimitiveSerializer<IdentityVerificationDeletionResult> {
  @override
  final Iterable<Type> types = const [IdentityVerificationDeletionResult, _$IdentityVerificationDeletionResult];

  @override
  final String wireName = r'IdentityVerificationDeletionResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationDeletionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(IdentityVerificationDeletionResultStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'auditReference';
    yield serializers.serialize(
      object.auditReference,
      specifiedType: const FullType(String),
    );
    if (object.nextAttemptAt != null) {
      yield r'nextAttemptAt';
      yield serializers.serialize(
        object.nextAttemptAt,
        specifiedType: const FullType(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDeletionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationDeletionResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationDeletionResultStatusEnum),
          ) as IdentityVerificationDeletionResultStatusEnum;
          result.status = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'auditReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditReference = valueDes;
          break;
        case r'nextAttemptAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.nextAttemptAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationDeletionResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationDeletionResultBuilder();
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

class IdentityVerificationDeletionResultStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DELETED')
  static const IdentityVerificationDeletionResultStatusEnum DELETED = _$identityVerificationDeletionResultStatusEnum_DELETED;
  @BuiltValueEnumConst(wireName: r'DELETE_FAILED')
  static const IdentityVerificationDeletionResultStatusEnum DELETE_FAILED = _$identityVerificationDeletionResultStatusEnum_DELETE_FAILED;

  static Serializer<IdentityVerificationDeletionResultStatusEnum> get serializer => _$identityVerificationDeletionResultStatusEnumSerializer;

  const IdentityVerificationDeletionResultStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationDeletionResultStatusEnum> get values => _$identityVerificationDeletionResultStatusEnumValues;
  static IdentityVerificationDeletionResultStatusEnum valueOf(String name) => _$identityVerificationDeletionResultStatusEnumValueOf(name);
}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/access_reason.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'versioned_access_reason.g.dart';

/// VersionedAccessReason
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [expectedVersion] 
@BuiltValue()
abstract class VersionedAccessReason implements AccessReason, Built<VersionedAccessReason, VersionedAccessReasonBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  VersionedAccessReason._();

  factory VersionedAccessReason([void updates(VersionedAccessReasonBuilder b)]) = _$VersionedAccessReason;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VersionedAccessReasonBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VersionedAccessReason> get serializer => _$VersionedAccessReasonSerializer();
}

class _$VersionedAccessReasonSerializer implements PrimitiveSerializer<VersionedAccessReason> {
  @override
  final Iterable<Type> types = const [VersionedAccessReason, _$VersionedAccessReason];

  @override
  final String wireName = r'VersionedAccessReason';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VersionedAccessReason object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AccessReasonCode),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VersionedAccessReason object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VersionedAccessReasonBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
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
            specifiedType: const FullType(AccessReasonCode),
          ) as AccessReasonCode;
          result.reasonCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VersionedAccessReason deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VersionedAccessReasonBuilder();
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


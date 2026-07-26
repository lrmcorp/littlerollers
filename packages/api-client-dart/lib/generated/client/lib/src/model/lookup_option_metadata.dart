//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'lookup_option_metadata.g.dart';

/// LookupOptionMetadata
///
/// Properties:
/// * [roles] 
/// * [branchIds] 
@BuiltValue()
abstract class LookupOptionMetadata implements Built<LookupOptionMetadata, LookupOptionMetadataBuilder> {
  @BuiltValueField(wireName: r'roles')
  BuiltList<Role> get roles;

  @BuiltValueField(wireName: r'branchIds')
  BuiltList<String> get branchIds;

  LookupOptionMetadata._();

  factory LookupOptionMetadata([void updates(LookupOptionMetadataBuilder b)]) = _$LookupOptionMetadata;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LookupOptionMetadataBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LookupOptionMetadata> get serializer => _$LookupOptionMetadataSerializer();
}

class _$LookupOptionMetadataSerializer implements PrimitiveSerializer<LookupOptionMetadata> {
  @override
  final Iterable<Type> types = const [LookupOptionMetadata, _$LookupOptionMetadata];

  @override
  final String wireName = r'LookupOptionMetadata';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LookupOptionMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'roles';
    yield serializers.serialize(
      object.roles,
      specifiedType: const FullType(BuiltList, [FullType(Role)]),
    );
    yield r'branchIds';
    yield serializers.serialize(
      object.branchIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    LookupOptionMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LookupOptionMetadataBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'roles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Role)]),
          ) as BuiltList<Role>;
          result.roles.replace(valueDes);
          break;
        case r'branchIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.branchIds.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LookupOptionMetadata deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LookupOptionMetadataBuilder();
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


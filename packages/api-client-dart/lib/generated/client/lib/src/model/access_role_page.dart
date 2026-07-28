//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_role_definition.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'access_role_page.g.dart';

/// AccessRolePage
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class AccessRolePage implements Built<AccessRolePage, AccessRolePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<AccessRoleDefinition> get items;

  AccessRolePage._();

  factory AccessRolePage([void updates(AccessRolePageBuilder b)]) = _$AccessRolePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccessRolePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccessRolePage> get serializer => _$AccessRolePageSerializer();
}

class _$AccessRolePageSerializer implements PrimitiveSerializer<AccessRolePage> {
  @override
  final Iterable<Type> types = const [AccessRolePage, _$AccessRolePage];

  @override
  final String wireName = r'AccessRolePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccessRolePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(AccessRoleDefinition)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AccessRolePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccessRolePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AccessRoleDefinition)]),
          ) as BuiltList<AccessRoleDefinition>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AccessRolePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccessRolePageBuilder();
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


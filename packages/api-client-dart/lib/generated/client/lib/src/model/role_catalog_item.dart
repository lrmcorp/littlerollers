//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'role_catalog_item.g.dart';

/// RoleCatalogItem
///
/// Properties:
/// * [role] 
/// * [capabilities] 
/// * [assignable] 
/// * [readOnly] 
/// * [scope] 
@BuiltValue()
abstract class RoleCatalogItem implements Built<RoleCatalogItem, RoleCatalogItemBuilder> {
  @BuiltValueField(wireName: r'role')
  Role get role;
  // enum roleEnum {  CUSTOMER,  INSTRUCTOR,  ADMIN,  MANAGER,  OWNER,  SUPER_OWNER,  FINANCE,  OPS,  };

  @BuiltValueField(wireName: r'capabilities')
  BuiltList<String> get capabilities;

  @BuiltValueField(wireName: r'assignable')
  bool get assignable;

  @BuiltValueField(wireName: r'readOnly')
  bool get readOnly;

  @BuiltValueField(wireName: r'scope')
  RoleCatalogItemScopeEnum get scope;
  // enum scopeEnum {  GLOBAL,  BRANCH,  };

  RoleCatalogItem._();

  factory RoleCatalogItem([void updates(RoleCatalogItemBuilder b)]) = _$RoleCatalogItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RoleCatalogItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RoleCatalogItem> get serializer => _$RoleCatalogItemSerializer();
}

class _$RoleCatalogItemSerializer implements PrimitiveSerializer<RoleCatalogItem> {
  @override
  final Iterable<Type> types = const [RoleCatalogItem, _$RoleCatalogItem];

  @override
  final String wireName = r'RoleCatalogItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RoleCatalogItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(Role),
    );
    yield r'capabilities';
    yield serializers.serialize(
      object.capabilities,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'assignable';
    yield serializers.serialize(
      object.assignable,
      specifiedType: const FullType(bool),
    );
    yield r'readOnly';
    yield serializers.serialize(
      object.readOnly,
      specifiedType: const FullType(bool),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(RoleCatalogItemScopeEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RoleCatalogItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RoleCatalogItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Role),
          ) as Role;
          result.role = valueDes;
          break;
        case r'capabilities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.capabilities.replace(valueDes);
          break;
        case r'assignable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.assignable = valueDes;
          break;
        case r'readOnly':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.readOnly = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RoleCatalogItemScopeEnum),
          ) as RoleCatalogItemScopeEnum;
          result.scope = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RoleCatalogItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RoleCatalogItemBuilder();
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

class RoleCatalogItemScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GLOBAL')
  static const RoleCatalogItemScopeEnum GLOBAL = _$roleCatalogItemScopeEnum_GLOBAL;
  @BuiltValueEnumConst(wireName: r'BRANCH')
  static const RoleCatalogItemScopeEnum BRANCH = _$roleCatalogItemScopeEnum_BRANCH;

  static Serializer<RoleCatalogItemScopeEnum> get serializer => _$roleCatalogItemScopeEnumSerializer;

  const RoleCatalogItemScopeEnum._(String name): super(name);

  static BuiltSet<RoleCatalogItemScopeEnum> get values => _$roleCatalogItemScopeEnumValues;
  static RoleCatalogItemScopeEnum valueOf(String name) => _$roleCatalogItemScopeEnumValueOf(name);
}


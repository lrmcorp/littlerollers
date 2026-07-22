//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/session_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'me.g.dart';

/// Me
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [roles] 
/// * [branchIds] 
/// * [capabilities] 
/// * [assurance] 
/// * [sessionExpiresAt] 
/// * [branches] 
@BuiltValue()
abstract class Me implements Built<Me, MeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'roles')
  BuiltList<Role> get roles;

  @BuiltValueField(wireName: r'branchIds')
  BuiltList<String> get branchIds;

  @BuiltValueField(wireName: r'capabilities')
  BuiltList<String> get capabilities;

  @BuiltValueField(wireName: r'assurance')
  MeAssuranceEnum get assurance;
  // enum assuranceEnum {  BASE,  MFA,  };

  @BuiltValueField(wireName: r'sessionExpiresAt')
  DateTime get sessionExpiresAt;

  @BuiltValueField(wireName: r'branches')
  BuiltList<SessionBranch> get branches;

  Me._();

  factory Me([void updates(MeBuilder b)]) = _$Me;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Me> get serializer => _$MeSerializer();
}

class _$MeSerializer implements PrimitiveSerializer<Me> {
  @override
  final Iterable<Type> types = const [Me, _$Me];

  @override
  final String wireName = r'Me';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Me object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
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
    yield r'capabilities';
    yield serializers.serialize(
      object.capabilities,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'assurance';
    yield serializers.serialize(
      object.assurance,
      specifiedType: const FullType(MeAssuranceEnum),
    );
    yield r'sessionExpiresAt';
    yield serializers.serialize(
      object.sessionExpiresAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'branches';
    yield serializers.serialize(
      object.branches,
      specifiedType: const FullType(BuiltList, [FullType(SessionBranch)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Me object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MeBuilder result,
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
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
        case r'capabilities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.capabilities.replace(valueDes);
          break;
        case r'assurance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MeAssuranceEnum),
          ) as MeAssuranceEnum;
          result.assurance = valueDes;
          break;
        case r'sessionExpiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.sessionExpiresAt = valueDes;
          break;
        case r'branches':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SessionBranch)]),
          ) as BuiltList<SessionBranch>;
          result.branches.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Me deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MeBuilder();
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

class MeAssuranceEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BASE')
  static const MeAssuranceEnum BASE = _$meAssuranceEnum_BASE;
  @BuiltValueEnumConst(wireName: r'MFA')
  static const MeAssuranceEnum MFA = _$meAssuranceEnum_MFA;

  static Serializer<MeAssuranceEnum> get serializer => _$meAssuranceEnumSerializer;

  const MeAssuranceEnum._(String name): super(name);

  static BuiltSet<MeAssuranceEnum> get values => _$meAssuranceEnumValues;
  static MeAssuranceEnum valueOf(String name) => _$meAssuranceEnumValueOf(name);
}


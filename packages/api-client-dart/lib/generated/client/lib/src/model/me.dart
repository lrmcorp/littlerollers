//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/preferred_studio.dart';
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
/// * [customRoleCodes] - Active custom role codes resolved from database-managed RBAC.
/// * [branchIds] 
/// * [capabilities] 
/// * [globalCapabilities] - Capabilities with an effective global grant after deny precedence.
/// * [identityVerificationStatus] 
/// * [sessionExpiresAt] 
/// * [branches] 
/// * [preferredBranch] 
@BuiltValue()
abstract class Me implements Built<Me, MeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'roles')
  BuiltList<Role> get roles;

  /// Active custom role codes resolved from database-managed RBAC.
  @BuiltValueField(wireName: r'customRoleCodes')
  BuiltList<String> get customRoleCodes;

  @BuiltValueField(wireName: r'branchIds')
  BuiltList<String> get branchIds;

  @BuiltValueField(wireName: r'capabilities')
  BuiltList<String> get capabilities;

  /// Capabilities with an effective global grant after deny precedence.
  @BuiltValueField(wireName: r'globalCapabilities')
  BuiltList<String> get globalCapabilities;

  @BuiltValueField(wireName: r'identityVerificationStatus')
  MeIdentityVerificationStatusEnum get identityVerificationStatus;
  // enum identityVerificationStatusEnum {  NOT_REQUIRED,  PENDING,  ACTION_REQUIRED,  APPROVED,  };

  @BuiltValueField(wireName: r'sessionExpiresAt')
  DateTime get sessionExpiresAt;

  @BuiltValueField(wireName: r'branches')
  BuiltList<SessionBranch> get branches;

  @BuiltValueField(wireName: r'preferredBranch')
  PreferredStudio? get preferredBranch;

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
    yield r'customRoleCodes';
    yield serializers.serialize(
      object.customRoleCodes,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
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
    yield r'globalCapabilities';
    yield serializers.serialize(
      object.globalCapabilities,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'identityVerificationStatus';
    yield serializers.serialize(
      object.identityVerificationStatus,
      specifiedType: const FullType(MeIdentityVerificationStatusEnum),
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
    yield r'preferredBranch';
    yield object.preferredBranch == null ? null : serializers.serialize(
      object.preferredBranch,
      specifiedType: const FullType.nullable(PreferredStudio),
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
        case r'customRoleCodes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.customRoleCodes.replace(valueDes);
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
        case r'globalCapabilities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.globalCapabilities.replace(valueDes);
          break;
        case r'identityVerificationStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MeIdentityVerificationStatusEnum),
          ) as MeIdentityVerificationStatusEnum;
          result.identityVerificationStatus = valueDes;
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
        case r'preferredBranch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PreferredStudio),
          ) as PreferredStudio?;
          if (valueDes == null) continue;
          result.preferredBranch.replace(valueDes);
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

class MeIdentityVerificationStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'NOT_REQUIRED')
  static const MeIdentityVerificationStatusEnum NOT_REQUIRED = _$meIdentityVerificationStatusEnum_NOT_REQUIRED;
  @BuiltValueEnumConst(wireName: r'PENDING')
  static const MeIdentityVerificationStatusEnum PENDING = _$meIdentityVerificationStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const MeIdentityVerificationStatusEnum ACTION_REQUIRED = _$meIdentityVerificationStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const MeIdentityVerificationStatusEnum APPROVED = _$meIdentityVerificationStatusEnum_APPROVED;

  static Serializer<MeIdentityVerificationStatusEnum> get serializer => _$meIdentityVerificationStatusEnumSerializer;

  const MeIdentityVerificationStatusEnum._(String name): super(name);

  static BuiltSet<MeIdentityVerificationStatusEnum> get values => _$meIdentityVerificationStatusEnumValues;
  static MeIdentityVerificationStatusEnum valueOf(String name) => _$meIdentityVerificationStatusEnumValueOf(name);
}


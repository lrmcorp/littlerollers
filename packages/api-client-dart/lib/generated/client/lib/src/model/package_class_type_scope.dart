//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/package_branch_scope_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_class_type_scope.g.dart';

/// PackageClassTypeScope
///
/// Properties:
/// * [id] 
/// * [classTypeId] 
/// * [active] 
/// * [classType] 
@BuiltValue()
abstract class PackageClassTypeScope implements Built<PackageClassTypeScope, PackageClassTypeScopeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'classType')
  PackageBranchScopeBranch? get classType;

  PackageClassTypeScope._();

  factory PackageClassTypeScope([void updates(PackageClassTypeScopeBuilder b)]) = _$PackageClassTypeScope;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageClassTypeScopeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageClassTypeScope> get serializer => _$PackageClassTypeScopeSerializer();
}

class _$PackageClassTypeScopeSerializer implements PrimitiveSerializer<PackageClassTypeScope> {
  @override
  final Iterable<Type> types = const [PackageClassTypeScope, _$PackageClassTypeScope];

  @override
  final String wireName = r'PackageClassTypeScope';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageClassTypeScope object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType(PackageBranchScopeBranch),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PackageClassTypeScope object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageClassTypeScopeBuilder result,
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
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageBranchScopeBranch),
          ) as PackageBranchScopeBranch;
          result.classType.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackageClassTypeScope deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageClassTypeScopeBuilder();
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


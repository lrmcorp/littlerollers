//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_packages_inner.g.dart';

/// VoucherPackagesInner
///
/// Properties:
/// * [id] 
/// * [name] 
@BuiltValue()
abstract class VoucherPackagesInner implements Built<VoucherPackagesInner, VoucherPackagesInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  VoucherPackagesInner._();

  factory VoucherPackagesInner([void updates(VoucherPackagesInnerBuilder b)]) = _$VoucherPackagesInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherPackagesInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherPackagesInner> get serializer => _$VoucherPackagesInnerSerializer();
}

class _$VoucherPackagesInnerSerializer implements PrimitiveSerializer<VoucherPackagesInner> {
  @override
  final Iterable<Type> types = const [VoucherPackagesInner, _$VoucherPackagesInner];

  @override
  final String wireName = r'VoucherPackagesInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherPackagesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VoucherPackagesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherPackagesInnerBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VoucherPackagesInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherPackagesInnerBuilder();
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


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_preview_command.g.dart';

/// VoucherPreviewCommand
///
/// Properties:
/// * [packageId] 
/// * [branchId] 
/// * [code] 
@BuiltValue()
abstract class VoucherPreviewCommand implements Built<VoucherPreviewCommand, VoucherPreviewCommandBuilder> {
  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'code')
  String get code;

  VoucherPreviewCommand._();

  factory VoucherPreviewCommand([void updates(VoucherPreviewCommandBuilder b)]) = _$VoucherPreviewCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherPreviewCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherPreviewCommand> get serializer => _$VoucherPreviewCommandSerializer();
}

class _$VoucherPreviewCommandSerializer implements PrimitiveSerializer<VoucherPreviewCommand> {
  @override
  final Iterable<Type> types = const [VoucherPreviewCommand, _$VoucherPreviewCommand];

  @override
  final String wireName = r'VoucherPreviewCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherPreviewCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VoucherPreviewCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherPreviewCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VoucherPreviewCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherPreviewCommandBuilder();
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


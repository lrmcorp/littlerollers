//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'audit_export_command.g.dart';

/// AuditExportCommand
///
/// Properties:
/// * [branchIds] 
/// * [from] 
/// * [to] 
/// * [actorId] 
/// * [objectType] 
/// * [format] 
/// * [reason] 
@BuiltValue()
abstract class AuditExportCommand implements Built<AuditExportCommand, AuditExportCommandBuilder> {
  @BuiltValueField(wireName: r'branchIds')
  BuiltList<String> get branchIds;

  @BuiltValueField(wireName: r'from')
  DateTime get from;

  @BuiltValueField(wireName: r'to')
  DateTime get to;

  @BuiltValueField(wireName: r'actorId')
  String? get actorId;

  @BuiltValueField(wireName: r'objectType')
  String? get objectType;

  @BuiltValueField(wireName: r'format')
  AuditExportCommandFormatEnum get format;
  // enum formatEnum {  CSV,  JSONL,  };

  @BuiltValueField(wireName: r'reason')
  String get reason;

  AuditExportCommand._();

  factory AuditExportCommand([void updates(AuditExportCommandBuilder b)]) = _$AuditExportCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuditExportCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuditExportCommand> get serializer => _$AuditExportCommandSerializer();
}

class _$AuditExportCommandSerializer implements PrimitiveSerializer<AuditExportCommand> {
  @override
  final Iterable<Type> types = const [AuditExportCommand, _$AuditExportCommand];

  @override
  final String wireName = r'AuditExportCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuditExportCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchIds';
    yield serializers.serialize(
      object.branchIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'from';
    yield serializers.serialize(
      object.from,
      specifiedType: const FullType(DateTime),
    );
    yield r'to';
    yield serializers.serialize(
      object.to,
      specifiedType: const FullType(DateTime),
    );
    if (object.actorId != null) {
      yield r'actorId';
      yield serializers.serialize(
        object.actorId,
        specifiedType: const FullType(String),
      );
    }
    if (object.objectType != null) {
      yield r'objectType';
      yield serializers.serialize(
        object.objectType,
        specifiedType: const FullType(String),
      );
    }
    yield r'format';
    yield serializers.serialize(
      object.format,
      specifiedType: const FullType(AuditExportCommandFormatEnum),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AuditExportCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuditExportCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.branchIds.replace(valueDes);
          break;
        case r'from':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.from = valueDes;
          break;
        case r'to':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.to = valueDes;
          break;
        case r'actorId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.actorId = valueDes;
          break;
        case r'objectType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.objectType = valueDes;
          break;
        case r'format':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AuditExportCommandFormatEnum),
          ) as AuditExportCommandFormatEnum;
          result.format = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuditExportCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuditExportCommandBuilder();
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

class AuditExportCommandFormatEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CSV')
  static const AuditExportCommandFormatEnum CSV = _$auditExportCommandFormatEnum_CSV;
  @BuiltValueEnumConst(wireName: r'JSONL')
  static const AuditExportCommandFormatEnum JSONL = _$auditExportCommandFormatEnum_JSONL;

  static Serializer<AuditExportCommandFormatEnum> get serializer => _$auditExportCommandFormatEnumSerializer;

  const AuditExportCommandFormatEnum._(String name): super(name);

  static BuiltSet<AuditExportCommandFormatEnum> get values => _$auditExportCommandFormatEnumValues;
  static AuditExportCommandFormatEnum valueOf(String name) => _$auditExportCommandFormatEnumValueOf(name);
}


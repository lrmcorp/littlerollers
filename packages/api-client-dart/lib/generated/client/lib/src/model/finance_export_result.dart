//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_export_result.g.dart';

/// FinanceExportResult
///
/// Properties:
/// * [fileName] 
/// * [mimeType] 
/// * [content] 
/// * [controlHash] 
/// * [sourceCutoffAt] 
/// * [completeness] 
/// * [auditLogId] 
@BuiltValue()
abstract class FinanceExportResult implements Built<FinanceExportResult, FinanceExportResultBuilder> {
  @BuiltValueField(wireName: r'fileName')
  String get fileName;

  @BuiltValueField(wireName: r'mimeType')
  JsonObject? get mimeType;

  @BuiltValueField(wireName: r'content')
  String get content;

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  @BuiltValueField(wireName: r'sourceCutoffAt')
  DateTime get sourceCutoffAt;

  @BuiltValueField(wireName: r'completeness')
  FinanceExportResultCompletenessEnum get completeness;
  // enum completenessEnum {  COMPLETE,  INCOMPLETE,  };

  @BuiltValueField(wireName: r'auditLogId')
  String get auditLogId;

  FinanceExportResult._();

  factory FinanceExportResult([void updates(FinanceExportResultBuilder b)]) = _$FinanceExportResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceExportResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceExportResult> get serializer => _$FinanceExportResultSerializer();
}

class _$FinanceExportResultSerializer implements PrimitiveSerializer<FinanceExportResult> {
  @override
  final Iterable<Type> types = const [FinanceExportResult, _$FinanceExportResult];

  @override
  final String wireName = r'FinanceExportResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceExportResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'fileName';
    yield serializers.serialize(
      object.fileName,
      specifiedType: const FullType(String),
    );
    yield r'mimeType';
    yield object.mimeType == null ? null : serializers.serialize(
      object.mimeType,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'content';
    yield serializers.serialize(
      object.content,
      specifiedType: const FullType(String),
    );
    yield r'controlHash';
    yield serializers.serialize(
      object.controlHash,
      specifiedType: const FullType(String),
    );
    yield r'sourceCutoffAt';
    yield serializers.serialize(
      object.sourceCutoffAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'completeness';
    yield serializers.serialize(
      object.completeness,
      specifiedType: const FullType(FinanceExportResultCompletenessEnum),
    );
    yield r'auditLogId';
    yield serializers.serialize(
      object.auditLogId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceExportResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceExportResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'fileName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fileName = valueDes;
          break;
        case r'mimeType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.mimeType = valueDes;
          break;
        case r'content':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.content = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        case r'sourceCutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.sourceCutoffAt = valueDes;
          break;
        case r'completeness':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinanceExportResultCompletenessEnum),
          ) as FinanceExportResultCompletenessEnum;
          result.completeness = valueDes;
          break;
        case r'auditLogId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditLogId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceExportResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceExportResultBuilder();
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

class FinanceExportResultCompletenessEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'COMPLETE')
  static const FinanceExportResultCompletenessEnum COMPLETE = _$financeExportResultCompletenessEnum_COMPLETE;
  @BuiltValueEnumConst(wireName: r'INCOMPLETE')
  static const FinanceExportResultCompletenessEnum INCOMPLETE = _$financeExportResultCompletenessEnum_INCOMPLETE;

  static Serializer<FinanceExportResultCompletenessEnum> get serializer => _$financeExportResultCompletenessEnumSerializer;

  const FinanceExportResultCompletenessEnum._(String name): super(name);

  static BuiltSet<FinanceExportResultCompletenessEnum> get values => _$financeExportResultCompletenessEnumValues;
  static FinanceExportResultCompletenessEnum valueOf(String name) => _$financeExportResultCompletenessEnumValueOf(name);
}


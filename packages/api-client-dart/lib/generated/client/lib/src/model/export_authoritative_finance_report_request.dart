//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'export_authoritative_finance_report_request.g.dart';

/// ExportAuthoritativeFinanceReportRequest
///
/// Properties:
/// * [branchId] 
/// * [from] 
/// * [until] 
@BuiltValue()
abstract class ExportAuthoritativeFinanceReportRequest implements Built<ExportAuthoritativeFinanceReportRequest, ExportAuthoritativeFinanceReportRequestBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'from')
  Date get from;

  @BuiltValueField(wireName: r'until')
  Date get until;

  ExportAuthoritativeFinanceReportRequest._();

  factory ExportAuthoritativeFinanceReportRequest([void updates(ExportAuthoritativeFinanceReportRequestBuilder b)]) = _$ExportAuthoritativeFinanceReportRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ExportAuthoritativeFinanceReportRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ExportAuthoritativeFinanceReportRequest> get serializer => _$ExportAuthoritativeFinanceReportRequestSerializer();
}

class _$ExportAuthoritativeFinanceReportRequestSerializer implements PrimitiveSerializer<ExportAuthoritativeFinanceReportRequest> {
  @override
  final Iterable<Type> types = const [ExportAuthoritativeFinanceReportRequest, _$ExportAuthoritativeFinanceReportRequest];

  @override
  final String wireName = r'ExportAuthoritativeFinanceReportRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ExportAuthoritativeFinanceReportRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    yield r'from';
    yield serializers.serialize(
      object.from,
      specifiedType: const FullType(Date),
    );
    yield r'until';
    yield serializers.serialize(
      object.until,
      specifiedType: const FullType(Date),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ExportAuthoritativeFinanceReportRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ExportAuthoritativeFinanceReportRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'from':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.from = valueDes;
          break;
        case r'until':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.until = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ExportAuthoritativeFinanceReportRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ExportAuthoritativeFinanceReportRequestBuilder();
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


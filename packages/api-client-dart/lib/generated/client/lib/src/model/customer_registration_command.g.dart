// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_registration_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerRegistrationCommandConsentEnum
_$customerRegistrationCommandConsentEnum_true_ =
    const CustomerRegistrationCommandConsentEnum._('true_');

CustomerRegistrationCommandConsentEnum
_$customerRegistrationCommandConsentEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$customerRegistrationCommandConsentEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerRegistrationCommandConsentEnum>
_$customerRegistrationCommandConsentEnumValues =
    BuiltSet<CustomerRegistrationCommandConsentEnum>(
      const <CustomerRegistrationCommandConsentEnum>[
        _$customerRegistrationCommandConsentEnum_true_,
      ],
    );

Serializer<CustomerRegistrationCommandConsentEnum>
_$customerRegistrationCommandConsentEnumSerializer =
    _$CustomerRegistrationCommandConsentEnumSerializer();

class _$CustomerRegistrationCommandConsentEnumSerializer
    implements PrimitiveSerializer<CustomerRegistrationCommandConsentEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerRegistrationCommandConsentEnum,
  ];
  @override
  final String wireName = 'CustomerRegistrationCommandConsentEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerRegistrationCommandConsentEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerRegistrationCommandConsentEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerRegistrationCommandConsentEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerRegistrationCommand extends CustomerRegistrationCommand {
  @override
  final String displayName;
  @override
  final String phone;
  @override
  final String email;
  @override
  final String password;
  @override
  final CustomerRegistrationCommandConsentEnum consent;
  @override
  final PrivateImageMetadata selfie;
  @override
  final PrivateImageMetadata ktp;

  factory _$CustomerRegistrationCommand([
    void Function(CustomerRegistrationCommandBuilder)? updates,
  ]) => (CustomerRegistrationCommandBuilder()..update(updates))._build();

  _$CustomerRegistrationCommand._({
    required this.displayName,
    required this.phone,
    required this.email,
    required this.password,
    required this.consent,
    required this.selfie,
    required this.ktp,
  }) : super._();
  @override
  CustomerRegistrationCommand rebuild(
    void Function(CustomerRegistrationCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerRegistrationCommandBuilder toBuilder() =>
      CustomerRegistrationCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerRegistrationCommand &&
        displayName == other.displayName &&
        phone == other.phone &&
        email == other.email &&
        password == other.password &&
        consent == other.consent &&
        selfie == other.selfie &&
        ktp == other.ktp;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jc(_$hash, consent.hashCode);
    _$hash = $jc(_$hash, selfie.hashCode);
    _$hash = $jc(_$hash, ktp.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerRegistrationCommand')
          ..add('displayName', displayName)
          ..add('phone', phone)
          ..add('email', email)
          ..add('password', password)
          ..add('consent', consent)
          ..add('selfie', selfie)
          ..add('ktp', ktp))
        .toString();
  }
}

class CustomerRegistrationCommandBuilder
    implements
        Builder<
          CustomerRegistrationCommand,
          CustomerRegistrationCommandBuilder
        > {
  _$CustomerRegistrationCommand? _$v;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  CustomerRegistrationCommandConsentEnum? _consent;
  CustomerRegistrationCommandConsentEnum? get consent => _$this._consent;
  set consent(CustomerRegistrationCommandConsentEnum? consent) =>
      _$this._consent = consent;

  PrivateImageMetadata? _selfie;
  PrivateImageMetadata? get selfie => _$this._selfie;
  set selfie(PrivateImageMetadata? selfie) => _$this._selfie = selfie;

  PrivateImageMetadata? _ktp;
  PrivateImageMetadata? get ktp => _$this._ktp;
  set ktp(PrivateImageMetadata? ktp) => _$this._ktp = ktp;

  CustomerRegistrationCommandBuilder() {
    CustomerRegistrationCommand._defaults(this);
  }

  CustomerRegistrationCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _displayName = $v.displayName;
      _phone = $v.phone;
      _email = $v.email;
      _password = $v.password;
      _consent = $v.consent;
      _selfie = $v.selfie;
      _ktp = $v.ktp;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerRegistrationCommand other) {
    _$v = other as _$CustomerRegistrationCommand;
  }

  @override
  void update(void Function(CustomerRegistrationCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerRegistrationCommand build() => _build();

  _$CustomerRegistrationCommand _build() {
    final _$result =
        _$v ??
        _$CustomerRegistrationCommand._(
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'CustomerRegistrationCommand',
            'displayName',
          ),
          phone: BuiltValueNullFieldError.checkNotNull(
            phone,
            r'CustomerRegistrationCommand',
            'phone',
          ),
          email: BuiltValueNullFieldError.checkNotNull(
            email,
            r'CustomerRegistrationCommand',
            'email',
          ),
          password: BuiltValueNullFieldError.checkNotNull(
            password,
            r'CustomerRegistrationCommand',
            'password',
          ),
          consent: BuiltValueNullFieldError.checkNotNull(
            consent,
            r'CustomerRegistrationCommand',
            'consent',
          ),
          selfie: BuiltValueNullFieldError.checkNotNull(
            selfie,
            r'CustomerRegistrationCommand',
            'selfie',
          ),
          ktp: BuiltValueNullFieldError.checkNotNull(
            ktp,
            r'CustomerRegistrationCommand',
            'ktp',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

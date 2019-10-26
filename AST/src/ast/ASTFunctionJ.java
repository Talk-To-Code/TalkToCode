package ast;

import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * this class is main in charge of construction of AST node that represents a function declaration
 * (including signature and body) of JAVA programs
 *
 */
public final class ASTFunctionJ extends ASTFunction {
	private ArrayList<String> modifiers;
	private ASTExpressionUnitTypes returnType;
	private ArrayList<ASTExpressionUnitTypes> types;
	private ArrayList<ASTExpressionUnitIdentifier> parameters;
	public ASTFunctionJ(String name) {
		super(name);
		this.returnType = new ASTExpressionUnitTypes("void");//default
		this.types = new ArrayList<ASTExpressionUnitTypes>();
		this.parameters = new ArrayList<ASTExpressionUnitIdentifier>();
		this.modifiers = new ArrayList<String>();
		
	}
	public void addModifier(String modifier){
		this.modifiers.add(modifier);
		
	}
	public void addParameter(ASTExpressionUnitTypes t,ASTExpressionUnitIdentifier p){
		this.parameters.add(p);
		p.addParent(this);
		this.types.add(t);
		t.addParent(this);
	}
	public void addReturnType(ASTExpressionUnitTypes t){
		this.returnType = t;
		t.addParent(this);
	}
	public String toSyntax(){
		this.result = "";
		//adding modifiers
		for(String mod : this.modifiers){
			this.result += mod;
			this.result += " ";
		}
		//adding return type
		this.result+=this.returnType.toSyntax();
		this.result+=" ";
		//adding method name
		this.result+=this.name.toSyntax();
		//adding parameters
		this.result+="(";
		for(int j =0;j<this.types.size();j++){
			this.result+=this.types.get(j).toSyntax();
			this.result+=" ";
			this.result+=this.parameters.get(j).toSyntax();
			if(j!=this.types.size()-1){
				this.result+=", ";
			}
		}
		this.result+="){\n";
		//adding statements
		for(ASTStatement s:this.statements){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result+="\t";
			this.result+=s.toSyntax();
			this.result+="\n";
		}
		for(int i = 0; i < this.indent; i++) this.result+="\t";
		this.result+="}\n";
		return this.result;
	}
}
